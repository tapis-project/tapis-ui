/**
 * The sentence a nav says while you are searching it.
 *
 * The behaviour it describes is old and correct — the box filters the
 * rows the nav holds — but it was never stated, so an empty result read
 * as "no such system" rather than "not in the fifty I fetched". These
 * pin the two halves: the window (which loading more fixes) and the
 * records no search can reach at all (which it does not).
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import NavSearchScope from '../NavSearchScope';
import type { SpineForBar } from '../NavWindowBar';

const spine = (over: Partial<SpineForBar> = {}): SpineForBar => ({
  meta: { loaded: 50, total: 312, complete: false, truncated: true },
  canExpand: true,
  expanding: false,
  expand: () => {},
  expandAll: () => {},
  windowSize: 50,
  ...over,
});

describe('what the search reached', () => {
  it('names the window, and offers the press that widens it', () => {
    const expandAll = jest.fn();
    render(<NavSearchScope noun="systems" spine={spine({ expandAll })} />);
    expect(
      screen.getByText(/Searching the 50 loaded systems/)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText('load all'));
    expect(expandAll).toHaveBeenCalled();
  });

  it('stops hedging once the window holds everything', () => {
    render(
      <NavSearchScope
        noun="systems"
        spine={spine({
          meta: { loaded: 12, total: 12, complete: true, truncated: false },
        })}
      />
    );
    expect(screen.getByText(/Searching all 12 systems\./)).toBeInTheDocument();
    // nothing to load, so nothing is offered
    expect(screen.queryByText('load all')).toBeNull();
  });

  it('says what no search can reach, when that is true', () => {
    render(
      <NavSearchScope
        noun="jobs"
        spine={spine()}
        unreachable="Hidden jobs are in no listing and no search."
      />
    );
    expect(
      screen.getByText('Hidden jobs are in no listing and no search.')
    ).toBeInTheDocument();
  });

  it('says nothing about unreachable records when there are none', () => {
    // the warning that does not apply is the one people learn to skip
    const { container } = render(
      <NavSearchScope noun="systems" spine={spine()} />
    );
    expect(container.textContent).not.toMatch(/no listing|hidden/i);
  });

  it('carries a preference-dependent aside, both ways round', () => {
    const { rerender } = render(
      <NavSearchScope
        noun="systems"
        spine={spine()}
        byPreference="The 3 deleted are included."
      />
    );
    expect(screen.getByText(/3 deleted are included/)).toBeInTheDocument();
    rerender(
      <NavSearchScope
        noun="systems"
        spine={spine()}
        byPreference="The 3 deleted are not, while they are hidden."
      />
    );
    expect(screen.getByText(/3 deleted are not/)).toBeInTheDocument();
  });

  it('survives a nav that has no window spine at all', () => {
    render(<NavSearchScope noun="apps" />);
    expect(screen.getByText(/Searching all 0 apps\./)).toBeInTheDocument();
  });
});
