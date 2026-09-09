import React from 'react';
import { act, render } from '@testing-library/react';
import { useDebouncedValue } from '../hooks';

// Regression: the hook was being called as useDebouncedValue({ values, errors }).
// A fresh object every render meant the effect always rescheduled and always set
// state, so the panel re-rendered every 200ms forever — which, among other
// things, closed any native <select> the moment it was opened.
const Probe: React.FC<{ a: number; onRender: () => void }> = ({
  a,
  onRender,
}) => {
  onRender();
  // the exact shape that looped: a literal wrapping unchanged members
  useDebouncedValue({ a, errors: undefined });
  return null;
};

describe('useDebouncedValue', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('settles instead of re-rendering forever', () => {
    let renders = 0;
    const count = () => (renders += 1);
    const { rerender } = render(<Probe a={1} onRender={count} />);

    // one outside re-render is all the loop ever needed to start: the publish
    // re-renders the component, which builds another literal, which schedules
    // another publish...
    rerender(<Probe a={2} onRender={count} />);
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    const afterSettling = renders;

    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(renders).toBe(afterSettling);
  });

  it('publishes a new value once the delay passes', () => {
    const first = { a: 1 };
    const second = { a: 2 };
    let seen: unknown;
    const Reader: React.FC<{ value: unknown }> = ({ value }) => {
      seen = useDebouncedValue(value, 200);
      return null;
    };

    const { rerender } = render(<Reader value={first} />);
    rerender(<Reader value={second} />);
    expect(seen).toBe(first);

    act(() => {
      jest.advanceTimersByTime(250);
    });
    expect(seen).toBe(second);
  });
});
