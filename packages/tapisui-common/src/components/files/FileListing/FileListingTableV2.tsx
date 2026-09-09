/**
 * The file listing, rebuilt.
 *
 * The old one was a react-table over reactstrap over bootstrap: three grey
 * icons for every kind of file, absolute timestamps in full, sizes and names
 * in the same weight, no sorting, and row padding tuned for a page that had
 * twelve rows on it rather than four hundred. It has been the same table
 * since the app was a prototype.
 *
 * This is the same data as a file manager would show it:
 *
 *   · directories first, always, and names sorted the way people count —
 *     run2 before run10
 *   · sortable columns, because "what did this job write last" is the actual
 *     question and the old table could not answer it
 *   · an icon per kind of file, muted, so forty job outputs are not forty
 *     identical grey pages
 *   · relative times, with the real one on hover
 *   · owner and permissions on request; they are rarely the question
 *   · a status line that says what is in the directory and how much of it
 *     you have picked
 *
 * ── Selecting, the way a file manager does it ──────────────────────────────
 *
 * Clicking a row used to toggle it into a selection, which made the file
 * listing the one place in the app where pressing a thing did not open it.
 * Now, as in Dolphin:
 *
 *   · a box appears on the icon's corner while the pointer is on the row, and
 *     that is what selects — accumulating, so you can tick four files without
 *     holding anything down. It is never a blank box: it shows a + on a file
 *     you are about to add and a − on one you are about to drop, so it says
 *     what pressing it will do rather than what the file's state is.
 *   · double-click opens. Directories are entered, files go to the viewer.
 *   · a single click makes that row the current one. It is highlighted, so
 *     the press plainly did something — but it is not ticked, because being
 *     the row you are looking at and being one of the files an operation
 *     will run on are two different facts and the box is where the second
 *     one is kept.
 *   · Ctrl or ⌘ ticks without dropping the rest, Shift takes the run.
 *   · middle-click opens a directory in a browser tab.
 *
 * ── And all of it from the keyboard ────────────────────────────────────────
 *
 *   ↑ ↓          move the current row, scrolling it into view even when it
 *                was too far off to be mounted
 *   → or Enter   open it — into the directory, or into the viewer
 *   ← or ⌫       back, the same back the path bar's arrow does
 *   Esc          let go of the current row; press it again and that is back
 *
 * Esc reading as two things in order is deliberate: the first press undoes
 * the smallest thing you did, and only once there is nothing left to let go
 * of does it mean leave.
 *
 * ── Why this file avoids `sx` on anything that repeats ─────────────────────
 *
 * Every `sx` prop is an object emotion has to serialise and hash on each
 * render. At one per cell that is thousands of serialisations for a directory
 * of four hundred files. So the table's styling is declared ONCE, on the
 * table element, as descendant rules over plain `<td className>`; rows are
 * memoised; hover is CSS, so moving the pointer down a listing re-renders
 * nothing at all; and past a threshold only the rows near the viewport are
 * mounted.
 */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useHistory } from 'react-router-dom';
import { Files } from '@tapis/tapis-typescript';
import { Box, CircularProgress, Tooltip, Typography } from '@mui/material';
import {
  ArrowDownwardRounded,
  ArrowUpwardRounded,
  ArticleOutlined,
  CheckBox,
  CheckBoxOutlineBlank,
  CodeRounded,
  DataObjectRounded,
  DescriptionOutlined,
  FolderRounded,
  ImageOutlined,
  InsertDriveFileOutlined,
  LinkRounded,
  MemoryRounded,
  QuestionMarkRounded,
  UnfoldLessRounded,
  UnfoldMoreRounded,
  ViewColumnRounded,
  AddBoxOutlined,
  IndeterminateCheckBoxOutlined,
  FolderZipOutlined,
} from '@mui/icons-material';
import sizeFormat from '../../../utils/sizeFormat';
import {
  effectiveType,
  fileKind,
  FileKind,
  isDirLike,
  KIND_COLOR,
  KIND_LABEL,
} from './fileKind';
import { setListingDensity, setListingDetails } from './listingPrefs';
import { keyboardIsBusy } from './keyboardNav';
import type { OnNavigateCallback, SelectMode } from './FileListing';

export type FileSortKey = 'name' | 'size' | 'modified';
export type SortDirection = 'asc' | 'desc';

/**
 * Whether this row gets a tick box at all.
 *
 * One answer, shared by the box, the select-all header and the callbacks
 * upstream in FileListing. It used to be split: the box rendered on every
 * row of a selectable table while the callback quietly refused anything
 * whose raw type was not in the filter — and a symbolic link's raw type
 * never is. So down a sorted listing, where links sit interleaved among the
 * directories they point at, the box worked on some rows and swallowed the
 * press on others in a pattern that read as random. A control that can do
 * nothing does not appear; everything that appears works.
 */
export const canSelectFile = (
  file: Files.FileInfo,
  selectMode?: SelectMode
): boolean => {
  if (!selectMode || selectMode.mode === 'none') return false;
  const type = effectiveType(file);
  return Boolean(type && selectMode.types?.some((wanted) => wanted === type));
};

/**
 * The thing it points at, with a shortcut badge on it.
 *
 * A bare chain says 'link' and leaves the more useful half unsaid: what you
 * will get when you open it. So it is the ordinary folder or file glyph in
 * its ordinary colour, with a dark chain across it.
 *
 * The chain sits over the middle and takes most of the glyph, because a
 * corner badge at this size is four dark pixels nobody can read. A white
 * halo keeps it legible against the folder's amber without needing a second
 * colour for the folder itself.
 */
const Linked =
  (Base: React.ElementType): React.FC<Record<string, unknown>> =>
  ({ className, titleAccess, sx }: any) =>
    (
      <Box component="span" className={className} sx={sx}>
        <Base
          titleAccess={titleAccess}
          sx={{ fontSize: 15, display: 'block', color: 'inherit' }}
        />
        <LinkRounded
          sx={{
            position: 'absolute',
            top: '52%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 13,
            color: '#1f2933',
            display: 'block',
            filter: 'drop-shadow(0 0 1.5px rgba(255,255,255,0.95))',
          }}
        />
      </Box>
    );

const KIND_ICON: Record<FileKind, React.ElementType> = {
  dir: FolderRounded,
  linkDir: Linked(FolderRounded),
  linkFile: Linked(InsertDriveFileOutlined),
  image: ImageOutlined,
  archive: FolderZipOutlined,
  code: CodeRounded,
  doc: DescriptionOutlined,
  data: DataObjectRounded,
  log: ArticleOutlined,
  binary: MemoryRounded,
  file: InsertDriveFileOutlined,
  unknown: QuestionMarkRounded,
};

const stamp = (file: Files.FileInfo): number => {
  const value = file.lastModified;
  if (!value) return 0;
  const time = new Date(value as unknown as string).getTime();
  return Number.isNaN(time) ? 0 : time;
};

/**
 * Directories first whatever you sorted by — a convention older than the web,
 * and the reason a listing is scannable at all. Names compare numerically, so
 * run2 lands before run10 instead of after run1.
 *
 * A symbolic link to a directory counts as one: it is a directory as far as
 * anyone using the listing is concerned, and sorting it down among the files
 * put $WORK and $SCRATCH somewhere nobody would look for them.
 */
export const sortFiles = (
  files: Array<Files.FileInfo>,
  key: FileSortKey,
  direction: SortDirection
): Array<Files.FileInfo> => {
  const factor = direction === 'asc' ? 1 : -1;
  return [...files].sort((a, b) => {
    const aDir = isDirLike(a);
    const bDir = isDirLike(b);
    if (aDir !== bDir) return aDir ? -1 : 1;
    if (key === 'size') return factor * ((a.size ?? 0) - (b.size ?? 0));
    if (key === 'modified') return factor * (stamp(a) - stamp(b));
    return (
      factor *
      (a.name ?? '').localeCompare(b.name ?? '', undefined, {
        numeric: true,
        sensitivity: 'base',
      })
    );
  });
};

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "3h ago", "yesterday", "12 Mar" — the exact stamp is a hover away. */
export const modifiedLabel = (
  file: Files.FileInfo,
  now: number = Date.now()
): string => {
  const time = stamp(file);
  if (!time) return '—';
  const ago = now - time;
  if (ago < 0) return 'just now';
  if (ago < MINUTE) return 'just now';
  if (ago < HOUR) return `${Math.floor(ago / MINUTE)}m ago`;
  if (ago < DAY) return `${Math.floor(ago / HOUR)}h ago`;
  if (ago < 2 * DAY) return 'yesterday';
  if (ago < 7 * DAY) return `${Math.floor(ago / DAY)}d ago`;
  const date = new Date(time);
  const sameYear = date.getFullYear() === new Date(now).getFullYear();
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
};

/**
 * "24 items · 8 folders · 1.4 GB", and how much of the directory that is.
 *
 * The Files API has no computeTotal, so most of the time there is no total to
 * put a count over: the only thing known is whether another page exists. So
 * `200+` when there is more to fetch and a plain `200` when the listing is
 * complete — and `200 of 430` on a deployment whose metadata does carry a
 * count, since reading it costs nothing when it is there.
 */
export const summarize = (
  files: Array<Files.FileInfo>,
  fetched: { total?: number; hasMore?: boolean } = {}
): string => {
  if (files.length === 0) return 'Empty directory';
  const folders = files.filter(isDirLike).length;
  const bytes = files.reduce(
    (total, file) => (isDirLike(file) ? total : total + (file.size ?? 0)),
    0
  );
  const counted =
    fetched.total && fetched.total > files.length
      ? `${files.length} of ${fetched.total} items`
      : `${files.length}${fetched.hasMore ? '+' : ''} item${
          files.length === 1 && !fetched.hasMore ? '' : 's'
        }`;
  const parts = [counted];
  if (folders) parts.push(`${folders} folder${folders === 1 ? '' : 's'}`);
  if (bytes) parts.push(sizeFormat(bytes));
  return parts.join(' · ');
};

/**
 * Below this a listing is cheaper to mount whole than to window — and jsdom,
 * where every element is zero pixels tall, never reaches it, so tests and
 * ordinary directories both get every row.
 */
/**
 * The icon column, which is also the whole hit area for the tick.
 *
 * Wider than the 18px glyph needs: the checkbox drawn in it is 14 pixels, and
 * a 14 pixel target is one you aim at rather than press. The column is the
 * target instead — see the ::before in tableSx.
 */
export const MARK_COLUMN = 38;

/**
 * How far PgUp and PgDn move.
 *
 * A fixed step rather than a screenful: a screenful of a tall pane is thirty
 * rows, which on any ordinary directory lands on the end and makes the key
 * indistinguishable from End. Seven is a faster arrow — enough to cover
 * ground, small enough that you can still see where you came from.
 */
export const PAGE_JUMP = 7;

/**
 * Where the pane has to be scrolled for row `index` to be comfortably on it.
 *
 * Two things the first attempt got wrong. The sticky header sits over the top
 * of the scroll container, so a row's position is header + index rows, not
 * index rows — leaving the last row you paged to about a header's height
 * below the bottom edge, which is precisely where you cannot see it. And a
 * row scrolled to exactly the edge is technically visible and practically
 * not, so there is a row of margin at each end: the selection always has a
 * neighbour showing past it, the way Dolphin does it.
 *
 * Returns undefined when the row is already comfortably in view — there is
 * no reason to move the pane under someone who can see what they selected.
 */
export const scrollTopFor = (
  index: number,
  view: { scrollTop: number; height: number; header: number; row: number }
): number | undefined => {
  if (view.height <= 0) return undefined;
  const top = view.header + index * view.row;
  const bottom = top + view.row;
  const margin = view.row;
  if (top - margin < view.scrollTop + view.header) {
    return Math.max(0, top - view.header - margin);
  }
  if (bottom + margin > view.scrollTop + view.height) {
    return bottom + margin - view.height;
  }
  return undefined;
};

export const VIRTUALIZE_ABOVE = 120;
const OVERSCAN = 12;

export type RowWindow = { start: number; end: number };

export const visibleWindow = (
  total: number,
  scrollTop: number,
  viewportHeight: number,
  rowHeight: number
): RowWindow => {
  if (total <= VIRTUALIZE_ABOVE || viewportHeight <= 0) {
    return { start: 0, end: total };
  }
  const first = Math.floor(scrollTop / rowHeight);
  const visible = Math.ceil(viewportHeight / rowHeight);
  return {
    start: Math.max(0, first - OVERSCAN),
    end: Math.min(total, first + visible + OVERSCAN),
  };
};

/**
 * Every rule the rows use, declared once.
 *
 * Descendant selectors rather than an `sx` per cell: emotion serialises each
 * `sx` object it is handed, and a `sx` on every cell of every row is the
 * difference between a listing that opens instantly and one that hitches on a
 * big directory.
 *
 * Every class is prefixed `tfl-`, and that is not decoration. The app still
 * ships Bootstrap 4, which defines `.row { display: flex }` and `.mark
 * { padding: .2em; background: #fcf8e3 }` globally. A `<tr className="row">`
 * picked those up, and a table row told to be a flex container stops being a
 * table row: the columns lose their widths and every name wraps down a strip
 * twenty pixels wide. Nothing here may use a name a global stylesheet might
 * also want.
 */
const tableSx = (rowHeight: number) =>
  ({
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
    fontSize: '0.76rem',

    '& td': {
      height: rowHeight,
      px: 0.75,
      py: 0,
      borderBottom: '1px solid rgba(0,0,0,0.05)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    '& td.tfl-mono': { fontFamily: 'monospace' },
    '& td.tfl-muted': { color: 'text.secondary' },
    '& td.tfl-num': { textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
    // overflow visible so the tick can sit proud of the icon's corner
    '& td.tfl-mark': {
      width: MARK_COLUMN,
      px: 0,
      textAlign: 'center',
      overflow: 'visible',
    },

    '& tr.tfl-row': {
      cursor: 'pointer',
      // double-click is the way in, and double-clicking text selects the word
      // under it — which flashes a blue smear over every name you open
      userSelect: 'none',
    },
    // a single click does nothing, so it has to at least feel heard
    '& tr.tfl-row:active': { bgcolor: 'rgba(21,101,192,0.16)' },
    // Every other row, faintly. The old listing did this and it is the
    // cheapest way to keep an eye on one line across four columns. Declared
    // before hover and selection so those win on equal specificity — and
    // driven by the row's index rather than :nth-child, because under
    // windowing the DOM's idea of 'second row' is whatever happens to be
    // mounted.
    '& tr.tfl-row.tfl-odd': { bgcolor: 'rgba(0,0,0,0.022)' },
    '& tr.tfl-row:hover': { bgcolor: 'rgba(0,0,0,0.035)' },
    // The current row — the one you last pressed — is grey and keeps a grey
    // bar. Ticked rows are blue and keep a blue one. Two different facts,
    // two different colours, and a row can be either, both or neither.
    '& tr.tfl-row.tfl-current': { bgcolor: 'rgba(0,0,0,0.07)' },
    '& tr.tfl-row.tfl-current > td:first-of-type': {
      boxShadow: 'inset 2px 0 0 rgba(0,0,0,0.38)',
    },
    '& tr.tfl-row.tfl-selected': { bgcolor: 'rgba(21,101,192,0.08)' },
    '& tr.tfl-row.tfl-selected:hover': { bgcolor: 'rgba(21,101,192,0.12)' },
    '& tr.tfl-row.tfl-current.tfl-selected': {
      bgcolor: 'rgba(21,101,192,0.14)',
    },
    '& tr.tfl-row.tfl-viewing': { bgcolor: 'rgba(21,101,192,0.14)' },
    // drawn inside the first cell so it cannot shift the row the way a real
    // border would
    '& tr.tfl-row.tfl-selected > td:first-of-type, & tr.tfl-row.tfl-viewing > td:first-of-type':
      { boxShadow: 'inset 2px 0 0 #1565c0' },

    // ── the Dolphin bit: the tick belongs to the row you are pointing at ──
    '& .tfl-mark-slot': {
      position: 'relative',
      display: 'inline-block',
      width: 18,
      height: 18,
      verticalAlign: 'middle',
    },
    '& .tfl-kind-icon': {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontSize: 15,
    },
    // A badge on the icon's top-left corner, not a lid over it: you should
    // still be able to tell a folder from a log while you are ticking it.
    // The translucent plate is what keeps a checkbox legible over a glyph.
    '& .tfl-mark-box': {
      position: 'absolute',
      top: -4,
      left: -5,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 14,
      height: 14,
      border: 'none',
      p: 0,
      m: 0,
      lineHeight: 0,
      cursor: 'pointer',
      opacity: 0,
      transition: 'opacity 90ms ease',
      borderRadius: '3px',
      bgcolor: 'rgba(252,252,251,0.82)',
      color: 'rgba(0,0,0,0.5)',
      '& svg': { fontSize: 13 },
      // The target is the whole icon column, not the 14px badge drawn in it.
      // Sized to the cell exactly rather than generously: any taller and it
      // would reach into the row above, and ticking the wrong file is worse
      // than missing the right one.
      '&::before': {
        content: '""',
        position: 'absolute',
        left: 5 - (MARK_COLUMN - 18) / 2,
        top: 4 - (rowHeight - 18) / 2,
        width: MARK_COLUMN,
        height: rowHeight,
      },
    },
    // hovered, focused, or already ticked: the box is there to be pressed
    '& tr.tfl-row:hover .tfl-mark-box, & tr.tfl-row.tfl-selected .tfl-mark-box, & .tfl-mark-box:focus-visible':
      { opacity: 1 },
    '& tr.tfl-row.tfl-selected .tfl-mark-box': { color: '#1565c0' },

    // The box says what pressing it WILL do, not what the file's state is:
    // a + on one you are about to add, a − on one you are about to drop. The
    // tick is only for the resting state of a selected row, where there is no
    // pointer to be about to do anything.
    '& .tfl-glyph-hover': { display: 'none' },
    '& tr.tfl-row:hover .tfl-glyph-hover': { display: 'block' },
    '& tr.tfl-row:hover .tfl-glyph-rest': { display: 'none' },

    // ── the shape of the table, while the rows are still coming ────────
    // The header, the columns and the status line are known before the API
    // answers, so they are drawn immediately and only the rows wait. A
    // spinner over the whole table threw that away and made every directory
    // open with a flash of nothing.
    '@keyframes tflPulse': {
      '0%': { opacity: 0.55 },
      '50%': { opacity: 0.22 },
      '100%': { opacity: 0.55 },
    },
    '& .tfl-skeleton': {
      display: 'inline-block',
      height: '0.62rem',
      borderRadius: '3px',
      bgcolor: 'rgba(0,0,0,0.18)',
      animation: 'tflPulse 1.25s ease-in-out infinite',
    },

    // a directory's name is heavier, because entering one is the move you
    // make most and it should be findable without reading the icon
    '& .tfl-dir-name': { fontWeight: 600 },
    // a picker still opens on one click, so there its name is a control
    '& button.tfl-dir-name': {
      border: 'none',
      background: 'none',
      p: 0,
      font: 'inherit',
      fontWeight: 600,
      color: 'inherit',
      cursor: 'pointer',
      '&:hover': { textDecoration: 'underline' },
    },
  } as const);

const HEAD_SX = {
  fontSize: '0.64rem',
  fontWeight: 700,
  color: 'text.secondary',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  userSelect: 'none',
} as const;

const SortHead: React.FC<
  React.PropsWithChildren<{
    column: FileSortKey;
    sort: FileSortKey;
    direction: SortDirection;
    onSort: (key: FileSortKey) => void;
    align?: 'left' | 'right';
    width?: number;
  }>
> = ({ column, sort, direction, onSort, align = 'left', width, children }) => {
  const active = sort === column;
  return (
    <Box
      component="th"
      scope="col"
      aria-sort={
        active
          ? direction === 'asc'
            ? 'ascending'
            : 'descending'
          : ('none' as never)
      }
      sx={{ p: 0, width, textAlign: align, fontWeight: 400 }}
    >
      <Box
        component="button"
        type="button"
        onClick={() => onSort(column)}
        sx={{
          ...HEAD_SX,
          width: '100%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
          gap: 0.25,
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          px: 0.75,
          py: 0.5,
          color: active ? 'text.primary' : 'text.secondary',
          '&:hover': { color: 'text.primary' },
        }}
      >
        {children}
        {/* the arrow only exists on the column doing the work */}
        {active &&
          (direction === 'asc' ? (
            <ArrowUpwardRounded sx={{ fontSize: 12 }} />
          ) : (
            <ArrowDownwardRounded sx={{ fontSize: 12 }} />
          ))}
      </Box>
    </Box>
  );
};

const StatusButton: React.FC<
  React.PropsWithChildren<{ label: string; title: string; onClick: () => void }>
> = ({ label, title, onClick, children }) => (
  <Tooltip title={title}>
    <Box
      component="button"
      type="button"
      aria-label={label}
      onClick={onClick}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.25,
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        borderRadius: '4px',
        px: 0.5,
        py: '2px',
        color: 'text.secondary',
        fontSize: '0.68rem',
        '&:hover': { bgcolor: 'rgba(0,0,0,0.05)', color: 'text.primary' },
        '& svg': { fontSize: 14 },
      }}
    >
      {children}
    </Box>
  </Tooltip>
);

/**
 * One row.
 *
 * Memoised, and every prop is a primitive or a callback the table holds
 * steady — so ticking one file re-renders one row rather than four hundred,
 * and hovering re-renders nothing, because hover is a CSS rule.
 */
type RowProps = {
  file: Files.FileInfo;
  index: number;
  selected: boolean;
  /** the row you last pressed: highlighted, but not ticked */
  current: boolean;
  viewing: boolean;
  selectable: boolean;
  showSize: boolean;
  showModified: boolean;
  details: boolean;
  now: number;
  singleClickOpens: boolean;
  location?: string;
  onOpen: (file: Files.FileInfo) => void;
  onToggle: (file: Files.FileInfo, index: number, shift: boolean) => void;
  /** a plain click: this row and nothing else */
  onPick: (file: Files.FileInfo, index: number) => void;
};

const FileRow: React.FC<RowProps> = React.memo(
  ({
    file,
    index,
    selected,
    current,
    viewing,
    selectable,
    showSize,
    showModified,
    details,
    now,
    singleClickOpens,
    location,
    onOpen,
    onToggle,
    onPick,
  }) => {
    const kind = fileKind(file);
    const Icon = KIND_ICON[kind];
    // a link to a directory IS a directory here: it opens into one, sorts
    // with them, has no size worth printing, and takes a browser tab
    const isDir = isDirLike(file);

    const className = [
      'tfl-row',
      index % 2 === 1 && 'tfl-odd',
      selected && 'tfl-selected',
      current && 'tfl-current',
      viewing && 'tfl-viewing',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <tr
        className={className}
        data-testid={file.name}
        onClick={(event) => {
          // ctrl/⌘ picks things out of a list everywhere else; shift takes the
          // run between here and the last one you touched
          if (
            selectable &&
            (event.metaKey || event.ctrlKey || event.shiftKey)
          ) {
            onToggle(file, index, event.shiftKey);
            return;
          }
          // A picker is a different bargain: you are there to choose a
          // destination, and making that a double-click would be tedious.
          if (singleClickOpens) {
            onOpen(file);
            return;
          }
          // Otherwise a plain click makes this the current row: highlighted,
          // so the press plainly landed, and not ticked, because ticking is
          // what the box is for.
          onPick(file, index);
        }}
        onDoubleClick={() => onOpen(file)}
        onMouseDown={(event) => {
          // suppress the autoscroll cursor a middle press otherwise starts
          if (event.button === 1) event.preventDefault();
        }}
        onAuxClick={(event) => {
          if (event.button !== 1 || !isDir || !location) return;
          event.preventDefault();
          // a directory has a page of its own, so it can have a tab of its
          // own; a file's contents live behind a one-use link and cannot
          window.open(`/#${location}/${file.name ?? ''}`, '_blank', 'noopener');
        }}
      >
        <td className="tfl-mark">
          <span className="tfl-mark-slot">
            <Icon
              className="tfl-kind-icon"
              titleAccess={KIND_LABEL[kind]}
              sx={{ color: KIND_COLOR[kind] }}
            />
            {selectable && (
              <button
                type="button"
                className="tfl-mark-box"
                aria-label={`Select ${file.name}`}
                aria-pressed={selected}
                onClick={(event) => {
                  event.stopPropagation();
                  onToggle(file, index, event.shiftKey);
                }}
                onDoubleClick={(event) => event.stopPropagation()}
              >
                {selected && (
                  <CheckBox className="tfl-glyph-rest" titleAccess="Selected" />
                )}
                {selected ? (
                  <IndeterminateCheckBoxOutlined
                    className="tfl-glyph-hover"
                    titleAccess="Remove from the selection"
                  />
                ) : (
                  <AddBoxOutlined
                    className="tfl-glyph-hover"
                    titleAccess="Add to the selection"
                  />
                )}
              </button>
            )}
          </span>
        </td>
        <td className="tfl-mono" title={file.name}>
          {isDir ? (
            singleClickOpens ? (
              <button
                type="button"
                className="tfl-dir-name"
                data-testid={`btn-link-${file.name}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onOpen(file);
                }}
              >
                {file.name}
              </button>
            ) : (
              <span className="tfl-dir-name">{file.name}</span>
            )
          ) : (
            file.name
          )}
        </td>
        {showSize && (
          <td className="tfl-num tfl-muted">
            {isDir ? '—' : sizeFormat(file.size ?? 0)}
          </td>
        )}
        {showModified && (
          <td
            className="tfl-num tfl-muted"
            title={
              file.lastModified
                ? new Date(file.lastModified as unknown as string).toString()
                : 'no timestamp'
            }
          >
            {modifiedLabel(file, now)}
          </td>
        )}
        {details && (
          <>
            <td className="tfl-muted">{KIND_LABEL[kind]}</td>
            <td className="tfl-muted">{file.owner ?? '—'}</td>
            <td className="tfl-mono tfl-muted">
              {file.nativePermissions ?? '—'}
            </td>
          </>
        )}
      </tr>
    );
  }
);

export type FileListingTableV2Props = {
  files: Array<Files.FileInfo>;
  selectedPaths: Record<string, boolean>;
  /** tick one file — the hover checkbox, and ctrl/⌘-click */
  onToggleSelect?: (file: Files.FileInfo) => void;
  /** add a run of files at once — shift-click */
  onSelectRange?: (files: Array<Files.FileInfo>) => void;
  onSelectAll?: () => void;
  onUnselectAll?: () => void;
  onInfiniteScroll?: () => void;
  isLoading?: boolean;
  onNavigate?: OnNavigateCallback;
  /** open the viewer on a file — a plain press, or the eye */
  onView?: (file: Files.FileInfo) => void;
  /**
   * The name of the directory you just came up out of, to stand on.
   *
   * A name rather than a path: the caller knows which child it left, and
   * matching by name sidesteps every question about whether a path has a
   * leading slash on it.
   */
  currentHint?: string;
  /** the first page has not arrived: draw the table, wait on the rows */
  isInitialLoading?: boolean;
  /**
   * Why there are no rows, when the answer is not "there are none".
   *
   * Rendered where the rows go rather than instead of the table, so a
   * directory you cannot read keeps its header, its status line and every
   * control that might still work on the next directory you try.
   */
  problem?: React.ReactNode;
  /** back, from ← ⌫ and the second Esc — the path bar's back, shared */
  onBack?: () => void;
  /**
   * Whether this listing answers the keyboard.
   *
   * True where the listing is the page. False where it is one section of a
   * scrolling page — a job's output browser has no business taking ↑ and ↓
   * away from the page they would otherwise scroll.
   */
  keyboard?: boolean;
  /** what the directory holds in total, when the service says */
  total?: number;
  /** whether there is another page to fetch */
  hasMore?: boolean;
  /** which file the viewer is showing, so its row can say so */
  viewingPath?: string;
  /**
   * The order the rows are actually in, whenever it changes.
   *
   * The sort lives here, so nothing above this component knows whether the
   * file under the one you are reading is the next one by name or by date —
   * and the viewer's up and down arrows have to walk the order you can see.
   */
  onOrderChange?: (files: Array<Files.FileInfo>) => void;
  location?: string;
  /**
   * `single` for a picker, where you are choosing a destination and a
   * double-click for every directory would be tedious. `double` everywhere
   * else, so a stray press cannot open anything.
   */
  openOn?: 'single' | 'double';
  selectMode?: SelectMode;
  fields?: Array<'size' | 'lastModified'>;
  density: 'compact' | 'comfortable';
  details: boolean;
  className?: string;
};

const FileListingTableV2: React.FC<FileListingTableV2Props> = ({
  files,
  selectedPaths,
  onToggleSelect,
  onSelectRange,
  onSelectAll,
  onUnselectAll,
  onInfiniteScroll,
  isLoading,
  isInitialLoading,
  problem,
  onNavigate,
  onView,
  onBack,
  keyboard = true,
  currentHint,
  total,
  hasMore,
  viewingPath,
  onOrderChange,
  location,
  openOn = 'double',
  selectMode,
  fields = ['size', 'lastModified'],
  density,
  details,
  className,
}) => {
  const [sort, setSort] = useState<FileSortKey>('name');
  const [direction, setDirection] = useState<SortDirection>('asc');
  const [scroll, setScroll] = useState({ top: 0, height: 0 });
  const [current, setCurrent] = useState<string | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const headRef = useRef<HTMLTableSectionElement | null>(null);
  const anchor = useRef<number | null>(null);
  const history = useHistory();
  const ticking = useRef(false);

  const selectable = Boolean(
    selectMode && selectMode.mode !== 'none' && onToggleSelect
  );
  const rowHeight = density === 'comfortable' ? 34 : 27;
  const showSize = fields.includes('size');
  const showModified = fields.includes('lastModified');

  const sorted = useMemo(
    () => sortFiles(files, sort, direction),
    [files, sort, direction]
  );

  // one clock for the whole table rather than a Date per row per render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const now = useMemo(() => Date.now(), [sorted]);

  const selectedCount = useMemo(
    () => files.filter((file) => selectedPaths[file.path ?? '']).length,
    [files, selectedPaths]
  );

  const onSort = useCallback(
    (key: FileSortKey) => {
      anchor.current = null;
      if (key === sort) {
        setDirection((was) => (was === 'asc' ? 'desc' : 'asc'));
        return;
      }
      setSort(key);
      // names read best A→Z; sizes and times read best biggest and newest first
      setDirection(key === 'name' ? 'asc' : 'desc');
    },
    [sort]
  );

  /**
   * Opening, on a double-click.
   *
   * Directory names stopped being links when single-click stopped opening —
   * a link you must not follow on a click is a lie — so entering one on the
   * Files page is a router push from here rather than a NavLink in the row.
   */
  const onOpen = useCallback(
    (file: Files.FileInfo) => {
      if (!isDirLike(file)) {
        onView?.(file);
        return;
      }
      if (onNavigate) onNavigate(file);
      else if (location) history.push(`${location}/${file.name ?? ''}`);
    },
    [onNavigate, onView, location, history]
  );

  /**
   * A plain click: this row becomes the current one, and the point a later
   * Shift-click reaches back to. It does not join the selection.
   */
  const onPick = useCallback((file: Files.FileInfo, index: number) => {
    anchor.current = index;
    setCurrent(file.path);
  }, []);

  const onToggle = useCallback(
    (file: Files.FileInfo, index: number, shift: boolean) => {
      if (shift && anchor.current !== null && onSelectRange) {
        const [from, to] = [anchor.current, index].sort((a, b) => a - b);
        onSelectRange(sorted.slice(from, to + 1));
        return;
      }
      anchor.current = index;
      onToggleSelect?.(file);
    },
    [onSelectRange, onToggleSelect, sorted]
  );

  // One state write per animation frame: a scroll event fires far more often
  // than the screen refreshes, and each one would otherwise re-window the
  // table and re-check for the next page.
  const onScroll = useCallback(() => {
    if (ticking.current) return;
    ticking.current = true;
    requestAnimationFrame(() => {
      ticking.current = false;
      const element = scrollRef.current;
      if (!element) return;
      setScroll({ top: element.scrollTop, height: element.clientHeight });
      if (!onInfiniteScroll) return;
      const remaining =
        element.scrollHeight - element.scrollTop - element.clientHeight;
      // a page early, so the next rows are there before you reach the bottom
      if (remaining < rowHeight * 6 && element.scrollTop > 0) {
        onInfiniteScroll();
      }
    });
  }, [onInfiniteScroll, rowHeight]);

  // Belt as well as braces: the caller now hands over a stable array, but a
  // future one might not, and reporting the order is a setState — an
  // unstable array here is an infinite render loop rather than a slow page.
  const reportedOrder = useRef<Array<Files.FileInfo> | null>(null);
  useEffect(() => {
    const previous = reportedOrder.current;
    if (
      previous &&
      previous.length === sorted.length &&
      previous.every((file, at) => file === sorted[at])
    ) {
      return;
    }
    reportedOrder.current = sorted;
    onOrderChange?.(sorted);
  }, [sorted, onOrderChange]);

  // the first measurement, so a long listing windows correctly before anyone
  // has touched the wheel
  useEffect(() => {
    const element = scrollRef.current;
    if (element) {
      setScroll({ top: element.scrollTop, height: element.clientHeight });
    }
  }, [rowHeight, sorted.length]);

  const { start, end } = visibleWindow(
    sorted.length,
    scroll.top,
    scroll.height,
    rowHeight
  );

  const currentIndex = useMemo(
    () => (current ? sorted.findIndex((file) => file.path === current) : -1),
    [current, sorted]
  );

  /**
   * Move the highlight, and bring it into view.
   *
   * By arithmetic rather than scrollIntoView: past the windowing threshold
   * the row being moved to is usually not mounted, so there is no element to
   * ask. Rows are a fixed height, which makes the offset exact anyway.
   */
  const moveTo = useCallback(
    (index: number) => {
      if (!sorted.length) return;
      const next = Math.min(Math.max(index, 0), sorted.length - 1);
      anchor.current = next;
      setCurrent(sorted[next].path);

      const element = scrollRef.current;
      if (!element) return;
      const scrollTop = scrollTopFor(next, {
        scrollTop: element.scrollTop,
        height: element.clientHeight,
        // measured, not assumed: the header is a row of buttons and comes
        // out a few pixels taller than a row of files
        header: headRef.current?.offsetHeight || rowHeight,
        row: rowHeight,
      });
      // the browser clamps the last row's overscroll for us
      if (scrollTop !== undefined) element.scrollTop = scrollTop;
    },
    [sorted, rowHeight]
  );

  // The rows arrive after the path changes, so this waits for the one it is
  // looking for and then applies once — a ref rather than state, because
  // landing on the folder is not something to re-render for twice.
  const appliedHint = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!currentHint) {
      appliedHint.current = undefined;
      return;
    }
    if (appliedHint.current === currentHint) return;
    const at = sorted.findIndex((file) => file.name === currentHint);
    if (at < 0) return;
    appliedHint.current = currentHint;
    moveTo(at);
  }, [currentHint, sorted, moveTo]);

  const moveCurrent = useCallback(
    (delta: number) => {
      if (!sorted.length) return;
      moveTo(
        currentIndex < 0
          ? delta > 0
            ? 0
            : sorted.length - 1
          : currentIndex + delta
      );
    },
    [sorted, currentIndex, moveTo]
  );

  useEffect(() => {
    if (!keyboard) return undefined;
    const onKey = (event: KeyboardEvent) => {
      // the viewer is on top of the listing, so it gets the keys
      if (viewingPath) return;
      // someone typing in the nav's search box, or working a modal, means
      // those keys for what they are looking at
      if (keyboardIsBusy()) return;

      const act = () => {
        switch (event.key) {
          case 'ArrowDown':
            moveCurrent(1);
            return true;
          case 'ArrowUp':
            moveCurrent(-1);
            return true;
          case 'PageDown':
            moveCurrent(PAGE_JUMP);
            return true;
          case 'PageUp':
            moveCurrent(-PAGE_JUMP);
            return true;
          case 'Home':
            moveTo(0);
            return true;
          case 'End':
            moveTo(sorted.length - 1);
            return true;
          case 'ArrowRight':
          case 'Enter': {
            const file = sorted[currentIndex];
            if (!file) return false;
            onOpen(file);
            return true;
          }
          case 'ArrowLeft':
          case 'Backspace':
            if (!onBack) return false;
            onBack();
            return true;
          case 'Escape':
            // let go of the row first; leaving is the second press
            if (currentIndex >= 0) {
              setCurrent(undefined);
              return true;
            }
            if (!onBack) return false;
            onBack();
            return true;
          default:
            return false;
        }
      };

      // only swallow the key if it was one of ours — Backspace especially,
      // which some browsers still read as 'go back a page'
      if (act()) event.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    keyboard,
    viewingPath,
    moveCurrent,
    sorted,
    currentIndex,
    onOpen,
    onBack,
  ]);

  // Select-all speaks for the rows that have a box, so a socket in the
  // directory cannot leave the header forever unticked over a full selection.
  const selectableFiles = useMemo(
    () =>
      selectable ? files.filter((file) => canSelectFile(file, selectMode)) : [],
    [selectable, files, selectMode]
  );
  const allSelected =
    selectableFiles.length > 0 &&
    selectableFiles.every((file) => selectedPaths[file.path ?? '']);

  const columnCount =
    2 + (showSize ? 1 : 0) + (showModified ? 1 : 0) + (details ? 2 : 0);

  return (
    <Box
      className={className}
      sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}
    >
      <Box
        ref={scrollRef}
        onScroll={onScroll}
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '4px',
          bgcolor: 'background.paper',
        }}
      >
        <Box component="table" sx={tableSx(rowHeight)}>
          <Box
            component="thead"
            ref={headRef}
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 1,
              bgcolor: '#fcfcfb',
              // the rule travels with the sticky header instead of scrolling
              // out from under it
              boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.12)',
            }}
          >
            <Box component="tr">
              {/* a th is left-aligned by default, which left this sitting off
                  to one side of the column its ticks line up under */}
              <Box
                component="th"
                sx={{ width: MARK_COLUMN, p: 0, textAlign: 'center' }}
              >
                {selectable && (
                  <Box
                    component="button"
                    type="button"
                    data-testid="select-all"
                    aria-label={allSelected ? 'Unselect all' : 'Select all'}
                    onClick={() =>
                      allSelected ? onUnselectAll?.() : onSelectAll?.()
                    }
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      verticalAlign: 'middle',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      p: 0,
                      m: 0,
                      lineHeight: 0,
                      color: allSelected ? '#1565c0' : 'rgba(0,0,0,0.3)',
                      '& svg': { fontSize: 15, display: 'block' },
                    }}
                  >
                    {allSelected ? <CheckBox /> : <CheckBoxOutlineBlank />}
                  </Box>
                )}
              </Box>
              <SortHead
                column="name"
                sort={sort}
                direction={direction}
                onSort={onSort}
              >
                Name
              </SortHead>
              {showSize && (
                <SortHead
                  column="size"
                  sort={sort}
                  direction={direction}
                  onSort={onSort}
                  align="right"
                  width={92}
                >
                  Size
                </SortHead>
              )}
              {showModified && (
                <SortHead
                  column="modified"
                  sort={sort}
                  direction={direction}
                  onSort={onSort}
                  align="right"
                  width={108}
                >
                  Modified
                </SortHead>
              )}
              {details && (
                <>
                  <Box component="th" sx={{ ...HEAD_SX, width: 108, px: 0.75 }}>
                    Kind
                  </Box>
                  <Box component="th" sx={{ ...HEAD_SX, width: 96, px: 0.75 }}>
                    Owner
                  </Box>
                  <Box component="th" sx={{ ...HEAD_SX, width: 96, px: 0.75 }}>
                    Mode
                  </Box>
                </>
              )}
            </Box>
          </Box>

          <tbody>
            {/* the rows above and below the window, as height rather than DOM */}
            {start > 0 && (
              <tr aria-hidden style={{ height: start * rowHeight }}>
                <td colSpan={columnCount} style={{ padding: 0, border: 0 }} />
              </tr>
            )}
            {isInitialLoading &&
              files.length === 0 &&
              Array.from({ length: 10 }, (_, row) => (
                <tr key={`skeleton-${row}`} aria-hidden>
                  <td className="tfl-mark" />
                  <td className="tfl-mono">
                    {/* uneven widths, because a column of identical bars
                        reads as a rendering bug rather than as waiting */}
                    <span
                      className="tfl-skeleton"
                      style={{ width: `${38 + ((row * 37) % 52)}%` }}
                    />
                  </td>
                  {showSize && (
                    <td className="tfl-num">
                      <span className="tfl-skeleton" style={{ width: '60%' }} />
                    </td>
                  )}
                  {showModified && (
                    <td className="tfl-num">
                      <span className="tfl-skeleton" style={{ width: '70%' }} />
                    </td>
                  )}
                  {details && (
                    <>
                      <td>
                        <span
                          className="tfl-skeleton"
                          style={{ width: '60%' }}
                        />
                      </td>
                      <td>
                        <span
                          className="tfl-skeleton"
                          style={{ width: '70%' }}
                        />
                      </td>
                      <td>
                        <span
                          className="tfl-skeleton"
                          style={{ width: '80%' }}
                        />
                      </td>
                    </>
                  )}
                </tr>
              ))}
            {sorted.slice(start, end).map((file, offset) => (
              <FileRow
                key={file.path ?? file.name}
                file={file}
                index={start + offset}
                selected={Boolean(selectedPaths[file.path ?? ''])}
                current={Boolean(file.path) && file.path === current}
                viewing={Boolean(file.path) && file.path === viewingPath}
                selectable={selectable && canSelectFile(file, selectMode)}
                showSize={showSize}
                showModified={showModified}
                details={details}
                now={now}
                singleClickOpens={openOn === 'single'}
                location={location}
                onOpen={onOpen}
                onToggle={onToggle}
                onPick={onPick}
              />
            ))}
            {end < sorted.length && (
              <tr
                aria-hidden
                style={{ height: (sorted.length - end) * rowHeight }}
              >
                <td colSpan={columnCount} style={{ padding: 0, border: 0 }} />
              </tr>
            )}
          </tbody>
        </Box>

        {isLoading && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              py: 1,
            }}
          >
            <CircularProgress size={13} />
            <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
              fetching more
            </Typography>
          </Box>
        )}

        {problem && <Box sx={{ px: 1.5 }}>{problem}</Box>}

        {!problem && !isLoading && !isInitialLoading && files.length === 0 && (
          <Box sx={{ px: 1.5, py: 3, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Nothing here
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
              Directories are listed a page at a time, so a slow system fills in
              as you scroll.
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── status line ────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 0.5,
          pt: 0.5,
          minWidth: 0,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.68rem',
            color: 'text.secondary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {problem
            ? 'Could not read this directory'
            : isInitialLoading && files.length === 0
            ? 'Reading the directory…'
            : summarize(files, { total, hasMore })}
          {selectedCount > 0 && ` · ${selectedCount} selected`}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <StatusButton
          label="Toggle detail columns"
          title={details ? 'Hide owner and mode' : 'Show owner and mode'}
          onClick={() => setListingDetails(!details)}
        >
          <ViewColumnRounded />
        </StatusButton>
        <StatusButton
          label="Toggle row density"
          title={
            density === 'compact' ? 'Roomier rows' : 'Fit more rows on screen'
          }
          onClick={() =>
            setListingDensity(density === 'compact' ? 'comfortable' : 'compact')
          }
        >
          {density === 'compact' ? (
            <UnfoldMoreRounded />
          ) : (
            <UnfoldLessRounded />
          )}
        </StatusButton>
      </Box>
    </Box>
  );
};

export default FileListingTableV2;
