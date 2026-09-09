/**
 * The sort model every landing table now shares. Apps had this behaviour
 * and the other three did not; the rules that were only implied there are
 * asserted here, once, for all four.
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { SortLabel, sortRows, useTableSort } from '../tableSort';

type Row = { id: string; owner?: string; size?: number | '' };

const rows: Row[] = [
  { id: 'beta', owner: 'zoe', size: 2 },
  { id: 'alpha', owner: 'Adam', size: 10 },
  { id: 'gamma', owner: '', size: '' },
];

const keyOf = (r: Row, columnId: string) =>
  columnId === 'owner' ? r.owner : columnId === 'size' ? r.size : r.id;
const idOf = (r: Row) => r.id;

const ids = (out: Row[]) => out.map((r) => r.id);

describe('sortRows', () => {
  it('returns the rows untouched when nothing is sorted', () => {
    const out = sortRows(rows, null, keyOf, idOf);
    expect(out).toBe(rows);
  });

  it('sorts text case-insensitively', () => {
    // 'Adam' before 'zoe' — a capital must not sort ahead of everything
    expect(
      ids(sortRows(rows, { id: 'owner', dir: 'asc' }, keyOf, idOf))
    ).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('sorts numbers as numbers, not as text', () => {
    // 10 after 2; as strings it would be the other way round
    expect(
      ids(sortRows(rows, { id: 'size', dir: 'asc' }, keyOf, idOf))
    ).toEqual(['beta', 'alpha', 'gamma']);
  });

  it('keeps empties last in BOTH directions', () => {
    // the point: a system with no owner recorded is not the first owner
    // alphabetically, and reversing the sort must not promote it to the top
    const asc = sortRows(rows, { id: 'owner', dir: 'asc' }, keyOf, idOf);
    const desc = sortRows(rows, { id: 'owner', dir: 'desc' }, keyOf, idOf);
    expect(ids(asc).at(-1)).toBe('gamma');
    expect(ids(desc).at(-1)).toBe('gamma');
  });

  it('breaks ties on the row id, so the order does not shuffle', () => {
    const tied: Row[] = [
      { id: 'b', owner: 'same' },
      { id: 'a', owner: 'same' },
    ];
    expect(
      ids(sortRows(tied, { id: 'owner', dir: 'asc' }, keyOf, idOf))
    ).toEqual(['a', 'b']);
    // and the same answer descending: the tiebreak is not flipped
    expect(
      ids(sortRows(tied, { id: 'owner', dir: 'desc' }, keyOf, idOf))
    ).toEqual(['a', 'b']);
  });

  it('leaves the rows alone for a column it cannot key', () => {
    expect(
      ids(sortRows(rows, { id: 'nonesuch', dir: 'asc' }, keyOf, idOf))
    ).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('does not mutate the array it was given', () => {
    const before = [...rows];
    sortRows(rows, { id: 'owner', dir: 'asc' }, keyOf, idOf);
    expect(rows).toEqual(before);
  });
});

const Harness: React.FC = () => {
  const { sort, cycleSort } = useTableSort();
  return (
    <>
      <SortLabel id="owner" label="Owner" sort={sort} onSort={cycleSort} />
      <SortLabel id="size" label="Size" sort={sort} onSort={cycleSort} />
      <span data-testid="state">
        {sort ? `${sort.id}:${sort.dir}` : 'none'}
      </span>
    </>
  );
};

describe('the press', () => {
  it('cycles asc, desc, then back to the page order', () => {
    render(<Harness />);
    const owner = screen.getByRole('button', { name: 'Sort by Owner' });
    expect(screen.getByTestId('state')).toHaveTextContent('none');
    fireEvent.click(owner);
    expect(screen.getByTestId('state')).toHaveTextContent('owner:asc');
    fireEvent.click(owner);
    expect(screen.getByTestId('state')).toHaveTextContent('owner:desc');
    // the third press is the one a two-state toggle cannot offer: off
    fireEvent.click(owner);
    expect(screen.getByTestId('state')).toHaveTextContent('none');
  });

  it('starts a fresh column ascending, not at the last one’s direction', () => {
    render(<Harness />);
    const owner = screen.getByRole('button', { name: 'Sort by Owner' });
    fireEvent.click(owner);
    fireEvent.click(owner);
    expect(screen.getByTestId('state')).toHaveTextContent('owner:desc');
    fireEvent.click(screen.getByRole('button', { name: 'Sort by Size' }));
    expect(screen.getByTestId('state')).toHaveTextContent('size:asc');
  });

  it('says which way it is sorting, for a screen reader too', () => {
    render(<Harness />);
    const owner = screen.getByRole('button', { name: 'Sort by Owner' });
    expect(owner).toHaveAttribute('aria-sort', 'none');
    fireEvent.click(owner);
    expect(owner).toHaveAttribute('aria-sort', 'ascending');
  });

  it('sorts from the keyboard', () => {
    render(<Harness />);
    const owner = screen.getByRole('button', { name: 'Sort by Owner' });
    fireEvent.keyDown(owner, { key: 'Enter' });
    expect(screen.getByTestId('state')).toHaveTextContent('owner:asc');
  });

  it('offers no press on a column with nothing to sort on', () => {
    render(
      <SortLabel
        id="glyph"
        label="Status"
        sort={null}
        onSort={jest.fn()}
        sortable={false}
      />
    );
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });
});
