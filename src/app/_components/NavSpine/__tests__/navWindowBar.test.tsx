import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import NavWindowBar, { SpineForBar } from '../NavWindowBar';

const meta = (over: object = {}) => ({
  loaded: 50,
  total: 312,
  complete: false,
  truncated: true,
  ...over,
});

const spine = (over: Partial<SpineForBar> = {}): SpineForBar => ({
  meta: meta(),
  canExpand: true,
  expanding: false,
  expand: () => {},
  expandAll: () => {},
  windowSize: 50,
  ...over,
});

const renderBar = (over: Partial<SpineForBar> = {}) =>
  render(<NavWindowBar noun="systems" spine={spine(over)} />);

describe('the window ledger', () => {
  it('says how much of the truth is in hand, and how to get more', () => {
    const expand = jest.fn();
    renderBar({ expand });
    expect(screen.getByText('50 of 312 systems')).toBeInTheDocument();
    fireEvent.click(screen.getByText('+50'));
    expect(expand).toHaveBeenCalled();
  });

  it('offers "all" only while the total keeps it reasonable', () => {
    const expandAll = jest.fn();
    renderBar({ expandAll });
    fireEvent.click(screen.getByText('all'));
    expect(expandAll).toHaveBeenCalled();

    renderBar({ meta: meta({ total: 5000, loaded: 50 }) });
    expect(screen.queryAllByText('all')).toHaveLength(1); // only the first render's
  });

  it('goes quiet when the window holds everything', () => {
    renderBar({
      meta: meta({ loaded: 62, total: 62, complete: true, truncated: false }),
      canExpand: false,
    });
    expect(screen.getByText('62 systems · all loaded')).toBeInTheDocument();
    expect(screen.queryByText('+50')).toBeNull();
  });

  it('says it is loading instead of counting zeros', () => {
    renderBar({
      isLoading: true,
      meta: meta({ loaded: 0, total: undefined }),
      canExpand: false,
      refresh: jest.fn(),
    });
    expect(screen.getByText('loading systems…')).toBeInTheDocument();
    // the amber note and the refresh press wait for real rows
    expect(screen.queryByText(/only the/)).toBeNull();
    expect(screen.queryByLabelText('Refresh systems list')).toBeNull();
  });

  it('speaks singular for one and plainly for none', () => {
    render(
      <NavWindowBar
        noun="jobs"
        spine={spine({
          meta: meta({ loaded: 1, total: 1, complete: true, truncated: false }),
          canExpand: false,
        })}
      />
    );
    expect(screen.getByText('1 job · loaded')).toBeInTheDocument();

    render(
      <NavWindowBar
        noun="jobs"
        spine={spine({
          meta: meta({ loaded: 0, total: 0, complete: true, truncated: false }),
          canExpand: false,
        })}
      />
    );
    expect(screen.getByText('no jobs yet')).toBeInTheDocument();
  });

  it('counts without pretending when the server never totalled', () => {
    renderBar({ meta: meta({ total: undefined }) });
    expect(screen.getByText('50 systems loaded')).toBeInTheDocument();
    expect(screen.queryByText('all')).toBeNull();
  });

  it('admits its age once the fetch stops being now', () => {
    renderBar({ fetchedAt: Date.now() - 5 * 60_000 });
    expect(screen.getByText(/5m old/)).toBeInTheDocument();
  });

  it('stays quiet about a fetch that just happened', () => {
    renderBar({ fetchedAt: Date.now() - 10_000 });
    expect(screen.queryByText(/old/)).toBeNull();
  });

  it('hands the refresh press to the window', () => {
    const refresh = jest.fn();
    renderBar({ refresh, fetchedAt: Date.now() });
    fireEvent.click(screen.getByLabelText('Refresh systems list'));
    expect(refresh).toHaveBeenCalled();
  });

  it('never grows transient text — the count just becomes the count', () => {
    // the +N flash tried this and read as flicker on every page load
    // (0 → first page also "grew"); the number changing IS the feedback
    const { rerender } = render(
      <NavWindowBar noun="systems" spine={spine()} />
    );
    rerender(
      <NavWindowBar
        noun="systems"
        spine={spine({ meta: meta({ loaded: 100 }) })}
      />
    );
    expect(screen.getByText('100 of 312 systems')).toBeInTheDocument();
    expect(screen.queryByText(/more in/)).toBeNull();
  });
});
