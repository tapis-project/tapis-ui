/**
 * Click-a-column sorting, for every landing table.
 *
 * Apps had this and the other three did not, which made the same dense
 * table behave three different ways depending on which page you were on.
 * Systems and Files are literally the same rows, and even those disagreed.
 *
 * The model is the one apps proved:
 *
 *   press once   sort ascending by that column
 *   press again  descending
 *   press again  back to the page's own order (recency, name, whatever the
 *                page sorts by when nobody has asked for anything)
 *
 * The third press matters. A sort you cannot undo is a mode you are stuck
 * in, and "no sort" is a real answer that a two-state toggle cannot give.
 *
 * Sorting is on a column's OWN key, not on what it renders: a cell can be
 * a link, a chip or a glyph, and none of those compare. A column that
 * supplies no key is simply not sortable, and its header stays plain
 * rather than offering a press that does nothing.
 */
import React from 'react';
import { Box } from '@mui/material';
import { ArrowDownwardRounded, ArrowUpwardRounded } from '@mui/icons-material';

export type TableSort = { id: string; dir: 'asc' | 'desc' } | null;

/** what a column contributes to an ordering */
export type SortKey = string | number;

/**
 * asc → desc → off. A fresh column always starts ascending, so pressing
 * across a row of headers never inherits the previous column's direction.
 */
export const useTableSort = () => {
  const [sort, setSort] = React.useState<TableSort>(null);
  const cycleSort = React.useCallback(
    (id: string) =>
      setSort((current) =>
        current?.id !== id
          ? { id, dir: 'asc' }
          : current.dir === 'asc'
          ? { id, dir: 'desc' }
          : null
      ),
    []
  );
  return { sort, cycleSort };
};

/**
 * Sort by a column key, empties last in BOTH directions.
 *
 * That asymmetry is deliberate: a system with no owner recorded is not
 * the alphabetically-first owner, and a job that never started does not
 * have the shortest runtime. Sending blanks to the bottom either way
 * keeps the rows you can actually read together at the top.
 *
 * Numbers compare numerically and text case-insensitively (with numeric
 * collation, so `app-2` precedes `app-10`). Ties break on `idOf` so the
 * order is stable across re-renders and re-fetches.
 */
export const sortRows = <T,>(
  rows: T[],
  sort: TableSort,
  keyOf: (row: T, columnId: string) => SortKey | undefined,
  idOf: (row: T) => string
): T[] => {
  if (!sort) return rows;
  const flip = sort.dir === 'desc' ? -1 : 1;
  return [...rows].sort((a, b) => {
    const ka = keyOf(a, sort.id);
    const kb = keyOf(b, sort.id);
    const emptyA = ka === undefined || ka === '' || ka === -1;
    const emptyB = kb === undefined || kb === '' || kb === -1;
    // never flipped: blanks sit at the bottom of ascending AND descending
    if (emptyA !== emptyB) return emptyA ? 1 : -1;
    if (emptyA && emptyB) return idOf(a).localeCompare(idOf(b));
    const cmp =
      typeof ka === 'number' && typeof kb === 'number'
        ? ka - kb
        : String(ka).localeCompare(String(kb), undefined, {
            sensitivity: 'base',
            numeric: true,
          });
    return cmp * flip || idOf(a).localeCompare(idOf(b));
  });
};

/**
 * A header label that sorts. Renders as plain text when the column has no
 * key to sort on, so a dead press is never offered.
 */
export const SortLabel: React.FC<{
  id: string;
  label: React.ReactNode;
  sort: TableSort;
  onSort: (id: string) => void;
  /** false for a column with nothing comparable behind it */
  sortable?: boolean;
}> = ({ id, label, sort, onSort, sortable = true }) => {
  if (!sortable) return <>{label}</>;
  const active = sort?.id === id;
  return (
    <Box
      component="span"
      role="button"
      tabIndex={0}
      aria-label={`Sort by ${typeof label === 'string' ? label : id}`}
      aria-sort={
        active ? (sort!.dir === 'asc' ? 'ascending' : 'descending') : 'none'
      }
      onClick={() => onSort(id)}
      onKeyDown={(event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSort(id);
        }
      }}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.25,
        cursor: 'pointer',
        userSelect: 'none',
        '&:hover': { color: 'text.primary' },
      }}
    >
      {label}
      {active &&
        (sort!.dir === 'asc' ? (
          <ArrowUpwardRounded sx={{ fontSize: 11 }} />
        ) : (
          <ArrowDownwardRounded sx={{ fontSize: 11 }} />
        ))}
    </Box>
  );
};
