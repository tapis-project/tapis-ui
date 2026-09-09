import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { DensityButton, getTableDensity, setTableDensity } from '../tableRail';
import { TableShell, windowFacts } from '../tableShell';
import {
  CAPPED_ROWS,
  explorerFit,
  explorerMinRows,
  makeChoiceStore,
  pinGap,
  tableChromePlacement,
  tableFit,
} from '../viewPrefs';

afterEach(() => {
  setTableDensity('compact');
  tableChromePlacement.reset();
  tableFit.reset();
  explorerFit.reset();
});

describe('the density preference', () => {
  it('one press roomies every landing table, and survives a reload', () => {
    render(<DensityButton />);
    expect(getTableDensity()).toBe('compact');
    fireEvent.click(screen.getByLabelText('Toggle row density'));
    expect(getTableDensity()).toBe('comfortable');
    expect(window.localStorage.getItem('tables.density')).toBe('comfortable');
  });
});

describe("the table's third fit: a fixed number of rows", () => {
  const shell = (
    <TableShell facts="Window: 10 of 312 systems">
      <table>
        <tbody>
          <tr>
            <td>a row</td>
          </tr>
        </tbody>
      </table>
    </TableShell>
  );

  const frame = (container: HTMLElement) =>
    container.firstElementChild as HTMLElement;

  it('grows with the page by default, capping nothing', () => {
    const { container } = render(shell);
    expect(frame(container).getAttribute('data-fit')).toBe('flow');
    expect(frame(container).getAttribute('data-cap')).toBeNull();
  });

  it('caps at CAPPED_ROWS rows without measuring the window', () => {
    // the point of the mode: 'pinned' is only as tall as the window
    // allows, and jsdom has no layout at all — this one still answers
    tableFit.set('capped');
    const { container } = render(shell);
    const capped = frame(container);
    expect(capped.getAttribute('data-fit')).toBe('capped');
    const px = Number(capped.getAttribute('data-cap'));
    expect(px).toBeGreaterThan(CAPPED_ROWS * 20);
    expect(px).toBeLessThan(CAPPED_ROWS * 60);
  });

  it('gives roomier rows a taller frame, for the same row count', () => {
    tableFit.set('capped');
    const { container: tight } = render(shell);
    const compactPx = Number(frame(tight).getAttribute('data-cap'));
    setTableDensity('comfortable');
    const { container: roomy } = render(shell);
    expect(Number(frame(roomy).getAttribute('data-cap'))).toBeGreaterThan(
      compactPx
    );
  });
});

describe('the view preference stores', () => {
  it('start at their defaults and remember a change', () => {
    expect(tableChromePlacement.get()).toBe('bottom');
    expect(tableFit.get()).toBe('flow');
    tableFit.set('capped');
    expect(tableFit.get()).toBe('capped');
    tableFit.reset();
    expect(explorerFit.get()).toBe('pinned');
    expect(pinGap.get()).toBe('6.4');
    expect(explorerMinRows.get()).toBe('14');
    tableChromePlacement.set('top');
    expect(window.localStorage.getItem('tables.chrome')).toBe('top');
    tableChromePlacement.reset();
    expect(tableChromePlacement.get()).toBe('bottom');
    expect(window.localStorage.getItem('tables.chrome')).toBeNull();
  });

  it('shrugs off a stored value from a future version', () => {
    window.localStorage.setItem('test.choice', 'holographic');
    const store = makeChoiceStore('test.choice', ['a', 'b'] as const, 'a');
    expect(store.get()).toBe('a');
    window.localStorage.removeItem('test.choice');
  });
});

describe('TableShell', () => {
  const shell = (
    <TableShell
      hint='filtered by nav search: "gpu"'
      about="The nav's search box filters this table too."
      controls={<button>columns</button>}
      error={new Error('SYSAPI_AUTH refused')}
      facts="Window: the 46 most recent jobs."
    >
      <table>
        <tbody>
          <tr>
            <td>the table</td>
          </tr>
        </tbody>
      </table>
    </TableShell>
  );

  it('carries the words and the presses in one strip', () => {
    render(shell);
    expect(screen.getByText(/filtered by nav search/)).toBeInTheDocument();
    // a transient hint REPLACES the window facts rather than joining them
    // with a dash — the strip says one thing at a time, and the facts are
    // back the moment the hint clears
    expect(screen.queryByText(/Window: the 46 most recent jobs/)).toBeNull();
    expect(
      screen.getByText(/Could not refresh this table/)
    ).toBeInTheDocument();
    expect(screen.getByText(/SYSAPI_AUTH refused/)).toBeInTheDocument();
    expect(screen.getByText('columns')).toBeInTheDocument();
    expect(screen.getByLabelText('About this table')).toBeInTheDocument();
    expect(screen.getByLabelText('Toggle row density')).toBeInTheDocument();
  });

  it('wears the strip below the table by default, above when asked', () => {
    const { container, rerender } = render(shell);
    const order = () => {
      const root = container.firstElementChild as HTMLElement;
      const children = Array.from(root.children);
      const tableAt = children.findIndex((child) =>
        child.querySelector('table')
      );
      const stripAt = children.findIndex((child) =>
        child.textContent?.includes('filtered by nav search')
      );
      return { tableAt, stripAt };
    };
    let placed = order();
    expect(placed.stripAt).toBeGreaterThan(placed.tableAt);

    tableChromePlacement.set('top');
    rerender(shell);
    placed = order();
    expect(placed.stripAt).toBeLessThan(placed.tableAt);
  });

  it('is just the facts and presses when nothing refused and nothing filters', () => {
    render(
      <TableShell facts="Window: 10 of 312 systems">
        <table />
      </TableShell>
    );
    expect(screen.queryByText(/Could not refresh/)).toBeNull();
    expect(screen.getByText('Window: 10 of 312 systems')).toBeInTheDocument();
  });
});

describe('windowFacts', () => {
  const spine = (over: object = {}) => ({
    meta: { truncated: true, total: 312 },
    windowSize: 50,
    ...over,
  });

  it('says nothing when the window holds everything', () => {
    // the caveat exists because rows are missing; with none missing there
    // is no caveat, and the strip has one less thing to read
    expect(
      windowFacts(12, 'systems', spine({ meta: { truncated: false } }))
    ).toBeUndefined();
    expect(windowFacts(12, 'systems', undefined)).toBeUndefined();
  });

  it('counts against the total, and says how to widen it', () => {
    expect(windowFacts(50, 'systems', spine())).toBe(
      "Window: 50 of 312 systems. The nav's +50 loads more"
    );
  });

  it('never renders "of more" — an unknown total is simply not stated', () => {
    // this is what put "Window: the 0 loaded apps of more" on the apps page
    expect(windowFacts(0, 'apps', spine({ meta: { truncated: true } }))).toBe(
      "Window: 0 apps loaded. The nav's +50 loads more"
    );
  });
});
