import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import SectionedPanel from '../SectionedPanel';
import { PanelGroup } from '../panelKit';

const groups: PanelGroup[] = [
  {
    label: 'Group',
    items: [
      {
        id: 'one',
        label: 'One',
        title: 'Section one',
        icon: <span />,
        render: () => <div>body one</div>,
      },
      {
        id: 'two',
        label: 'Two',
        title: 'Section two',
        icon: <span />,
        render: () => <div>body two</div>,
      },
    ],
  },
];

// jsdom reports every scroll metric as 0, so the content pane counts as both
// at-top and at-bottom. Only the downward direction is asserted here.
const flick = (times = 1) => {
  const pane = screen.getByText(/body/).parentElement as HTMLElement;
  for (let i = 0; i < times; i += 1) {
    // one flick = a burst carrying more than the 90px threshold
    fireEvent.wheel(pane, { deltaY: 60 });
    fireEvent.wheel(pane, { deltaY: 60 });
    // ...then quiet for longer than the gesture gap, ending it
    act(() => {
      jest.advanceTimersByTime(300);
    });
  }
};

// An unbroken scroll: wheel events with no quiet gap between them.
const scrollWithoutStopping = (totalDelta: number) => {
  const pane = screen.getByText(/body/).parentElement as HTMLElement;
  for (let sent = 0; sent < totalDelta; sent += 40) {
    fireEvent.wheel(pane, { deltaY: 40 });
    act(() => {
      jest.advanceTimersByTime(16); // ~60fps, well under the gesture gap
    });
  }
};

describe('SectionedPanel wheel paging', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('pages on a single flick by default', () => {
    render(<SectionedPanel groups={groups} title="Panel" />);
    expect(screen.getByText('body one')).toBeInTheDocument();
    flick();
    expect(screen.getByText('body two')).toBeInTheDocument();
  });

  it('asks for the flicks the host wants, counting down', () => {
    render(<SectionedPanel groups={groups} title="Panel" pageGestures={2} />);

    flick();
    expect(screen.getByText('body one')).toBeInTheDocument();
    expect(screen.getByText('1 more scroll')).toBeInTheDocument();

    flick();
    expect(screen.getByText('body two')).toBeInTheDocument();
  });

  it('counts down in the plural while more than one flick is left', () => {
    render(<SectionedPanel groups={groups} title="Panel" pageGestures={3} />);
    flick();
    expect(screen.getByText('2 more scrolls')).toBeInTheDocument();
    expect(screen.getByText('body one')).toBeInTheDocument();
  });

  it('forgets a half-finished streak after a long pause', () => {
    render(<SectionedPanel groups={groups} title="Panel" pageGestures={3} />);
    flick(2);
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    flick(2);
    // the streak restarted, so two more flicks are not enough
    expect(screen.getByText('body one')).toBeInTheDocument();
  });

  it('keeps counting during one unbroken scroll', () => {
    render(<SectionedPanel groups={groups} title="Panel" pageGestures={2} />);
    // first flick lands at 90px, the second after 200px more of travel
    scrollWithoutStopping(90 + 200 + 40);
    expect(screen.getByText('body two')).toBeInTheDocument();
  });

  it('does not page on a short continuous nudge', () => {
    render(<SectionedPanel groups={groups} title="Panel" pageGestures={2} />);
    scrollWithoutStopping(120);
    expect(screen.getByText('body one')).toBeInTheDocument();
  });
});
