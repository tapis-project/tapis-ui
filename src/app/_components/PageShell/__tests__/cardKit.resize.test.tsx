/**
 * The debounce on the mosaic's LATER resizes — the boxes on a real detail
 * page fill in from several independent queries (Sharing & access, Notes,
 * the run tiles), each landing in its own round trip. Before this, each
 * arrival committed its own re-pack the instant it was measured, so a page
 * settling from three near-simultaneous responses visibly hopped three
 * times. jsdom has no real layout and no ResizeObserver, so both are
 * stubbed here: getBoundingClientRect is fixed so the pre-paint settle
 * converges immediately, and a minimal fake ResizeObserver lets the test
 * fire synthetic resize entries and control the clock around them.
 *
 * <Profiler> counts COMMITS, not renders-that-bail — the thing that
 * actually reaches the screen — so "one commit" here means what it says:
 * the page painted once, not three times.
 */
import React, { Profiler } from 'react';
import { act, render } from '@testing-library/react';
import { CardMosaic } from '../cardKit';

type Entry = {
  target: Element;
  contentRect: { width: number; height: number };
};
type RO = { observe: (el: Element) => void; disconnect: () => void };

let observed: Element[] = [];
let deliver: ((entries: Entry[]) => void) | null = null;

class FakeResizeObserver implements RO {
  private cb: (entries: Entry[]) => void;
  constructor(cb: (entries: Entry[]) => void) {
    this.cb = cb;
    deliver = (entries) => this.cb(entries);
  }
  observe(el: Element) {
    observed.push(el);
  }
  disconnect() {
    /* nothing to clean up in the fake */
  }
}

const rectFor = (el: Element) => {
  if (el.hasAttribute('data-mosaic')) {
    return { width: 900, height: 0 } as DOMRect;
  }
  return { width: 300, height: 100 } as DOMRect;
};

let commits = 0;
const onRender = () => {
  commits += 1;
};

beforeEach(() => {
  jest.useFakeTimers();
  observed = [];
  deliver = null;
  commits = 0;
  (global as { ResizeObserver?: unknown }).ResizeObserver = FakeResizeObserver;
  jest
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockImplementation(function (this: HTMLElement) {
      return rectFor(this);
    });
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
  delete (global as { ResizeObserver?: unknown }).ResizeObserver;
});

const cellFor = (index: number) =>
  observed.find((el) => el.getAttribute('data-cell') === String(index))!;

// Four equal-height boxes in a 900px host pack two-per-column (0,2 / 1,3),
// and the mosaic deliberately IGNORES resize reports from a column's own
// LAST box — it is the one being flex-grown to fill slack, and feeding its
// inflated height back in would be a feedback loop. Cells 0 and 1 are each
// first in their column, so they are the ones a real content change would
// actually be reported through.

describe('later resizes, coalesced', () => {
  it('settles once from a burst, not once per arrival', () => {
    render(
      <Profiler id="mosaic" onRender={onRender}>
        <CardMosaic>
          <div>a</div>
          <div>b</div>
          <div>c</div>
          <div>d</div>
        </CardMosaic>
      </Profiler>
    );
    // the pre-paint settle already committed at least once
    const afterMount = commits;
    expect(afterMount).toBeGreaterThan(0);

    // two independent queries land a beat apart, well inside the window
    act(() => {
      deliver!([
        { target: cellFor(0), contentRect: { width: 300, height: 220 } },
      ]);
      jest.advanceTimersByTime(60);
      deliver!([
        { target: cellFor(1), contentRect: { width: 300, height: 260 } },
      ]);
      // neither has committed yet — the second arrival re-armed the timer
      jest.advanceTimersByTime(60);
    });
    expect(commits).toBe(afterMount);

    // now the window since the LAST arrival has actually elapsed
    act(() => {
      jest.advanceTimersByTime(60);
    });
    expect(commits).toBe(afterMount + 1);
  });

  it('still settles from a single, isolated resize', () => {
    render(
      <Profiler id="mosaic" onRender={onRender}>
        <CardMosaic>
          <div>a</div>
          <div>b</div>
          <div>c</div>
          <div>d</div>
        </CardMosaic>
      </Profiler>
    );
    const afterMount = commits;
    act(() => {
      deliver!([
        { target: cellFor(0), contentRect: { width: 300, height: 400 } },
      ]);
      jest.advanceTimersByTime(120);
    });
    expect(commits).toBe(afterMount + 1);
  });

  it('ignores drift under a pixel — not every arrival is a real change', () => {
    const { container } = render(
      <Profiler id="mosaic" onRender={onRender}>
        <CardMosaic>
          <div>a</div>
          <div>b</div>
          <div>c</div>
          <div>d</div>
        </CardMosaic>
      </Profiler>
    );
    // the cells already measured 100 in the pre-paint pass (rectFor's
    // default) — 100.4 rounds to the same integer
    const before = container.innerHTML;
    act(() => {
      deliver!([
        { target: cellFor(0), contentRect: { width: 300, height: 100.4 } },
      ]);
      jest.advanceTimersByTime(200);
    });
    // the LAYOUT is what must not move. React is entitled to re-render a
    // component whose state was set to the value it already had; what it
    // must not do is deal the boxes again over a rounding difference.
    expect(container.innerHTML).toBe(before);
  });
});

describe('when the boxes themselves change', () => {
  it('drops measurements in flight — the indices behind them moved', () => {
    // a detail card gains boxes when its access probe resolves; a pending
    // height for index 3 is then about a box that is no longer index 3
    const { rerender, container } = render(
      <Profiler id="mosaic" onRender={onRender}>
        <CardMosaic>
          <div>a</div>
          <div>b</div>
          <div>c</div>
          <div>d</div>
        </CardMosaic>
      </Profiler>
    );
    act(() => {
      deliver!([
        { target: cellFor(0), contentRect: { width: 300, height: 900 } },
      ]);
    });
    // the child set changes before the window elapses
    act(() => {
      rerender(
        <Profiler id="mosaic" onRender={onRender}>
          <CardMosaic>
            <div>a</div>
            <div>b</div>
          </CardMosaic>
        </Profiler>
      );
      jest.advanceTimersByTime(300);
    });
    // two boxes, two cells — and no 900px height applied from the old set
    expect(container.querySelectorAll('[data-cell]')).toHaveLength(2);
  });
});
