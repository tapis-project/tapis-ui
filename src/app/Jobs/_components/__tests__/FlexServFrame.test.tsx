import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import FlexServFrame from '../FlexServFrame';

const GEOMETRY_KEY = 'flexserv.frame.window';

const mount = () => {
  window.localStorage.setItem(
    GEOMETRY_KEY,
    JSON.stringify({ x: 100, y: 100, width: 600, height: 400 })
  );
  return render(<FlexServFrame address="http://host/" onClose={jest.fn()} />);
};

const grab = (edge: string) =>
  fireEvent.mouseDown(screen.getByLabelText(`Resize session window ${edge}`), {
    clientX: 500,
    clientY: 500,
  });

afterEach(() => {
  window.localStorage.clear();
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
});

const size = () => {
  const frame = screen.getByRole('dialog');
  const cs = window.getComputedStyle(frame);
  return { w: cs.width, h: cs.height };
};

describe('FlexServFrame resize', () => {
  it('leaves the height alone when a west edge moves', () => {
    mount();
    const before = size();
    grab('w');
    fireEvent.mouseMove(window, { clientX: 450, clientY: 560 });
    expect(size().h).toBe(before.h);
    expect(size().w).not.toBe(before.w);
    fireEvent.mouseUp(window);
  });

  it('changes the height on an edge that includes south', () => {
    mount();
    const before = size();
    grab('sw');
    fireEvent.mouseMove(window, { clientX: 500, clientY: 520 });
    expect(size().h).not.toBe(before.h);
    fireEvent.mouseUp(window);
  });
});

describe('FlexServFrame drag cleanup', () => {
  it('restores the body styles on mouse up', () => {
    mount();
    grab('se');
    expect(document.body.style.userSelect).toBe('none');
    fireEvent.mouseUp(window);
    expect(document.body.style.userSelect).toBe('');
    expect(document.body.style.cursor).toBe('');
  });

  it('restores the body styles when unmounted mid-drag', () => {
    const { unmount } = mount();
    grab('se');
    expect(document.body.style.userSelect).toBe('none');
    unmount();
    expect(document.body.style.userSelect).toBe('');
    expect(document.body.style.cursor).toBe('');
  });
});
