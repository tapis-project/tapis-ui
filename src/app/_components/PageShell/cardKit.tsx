/**
 * The summary card's fact grammar — the sx constants and the two building
 * blocks (Fact, InnerBox) that the card and its panels share. Split out of
 * SystemSummaryCard so sibling panels (notes, sharing) can speak the same
 * language without importing the whole card.
 */
import React, { useState } from 'react';
import { Box, Chip, Tooltip, Typography } from '@mui/material';
import { ContentCopyRounded, DoneRounded } from '@mui/icons-material';
import {
  MOSAIC_GAP,
  MOSAIC_MIN,
  columnsFor,
  layOut,
  spreadColumns,
} from './mosaic';

export { MOSAIC_MIN } from './mosaic';

/**
 * The tint a section wears inside a white card.
 *
 * The job card's Details box proved the ladder: the card is paper, a
 * section on it is tinted, and a box inside that section is paper again.
 * Each step of contrast is what makes a section readable AS a section
 * rather than as more rows of the same grid.
 */
export const SECTION_BG = '#fcfcfb';

export const LABEL_SX = {
  fontSize: '0.62rem',
  fontWeight: 700,
  color: 'text.secondary',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  whiteSpace: 'nowrap',
  pt: '2px',
} as const;

export const VALUE_SX = {
  fontSize: '0.76rem',
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 0.75,
  flexWrap: 'wrap',
} as const;

export const MONO_SX = {
  fontFamily: 'monospace',
  fontSize: '0.72rem',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  minWidth: 0,
} as const;

export const SMALL_CHIP_SX = {
  height: 18,
  fontSize: '0.65rem',
  borderRadius: '4px',
} as const;

/** the fact-row action: a small bordered press, quiet until hovered */
export const MICRO_BTN_SX = {
  px: 0.7,
  py: 0,
  borderRadius: '4px',
  border: '1px solid',
  borderColor: 'divider',
  color: 'text.secondary',
  fontSize: '0.66rem',
  fontWeight: 600,
  lineHeight: 1.7,
  textTransform: 'none',
  minWidth: 0,
  '&:hover': { bgcolor: 'rgba(0,0,0,0.05)', color: 'text.primary' },
} as const;

/** the same shape when the action would be destructive */
export const MICRO_BTN_DANGER_SX = {
  ...MICRO_BTN_SX,
  '&:hover': {
    bgcolor: 'rgba(198,40,40,0.06)',
    color: '#c62828',
    borderColor: '#c6282866',
  },
} as const;

/**
 * A tooltip that does not get in the way of the press underneath it.
 *
 * disableInteractive gives the popper `pointer-events: none`, so a tooltip
 * sitting over the button below is clicked straight through; the delays are
 * the other half — half a second on the first and on every one after, which
 * a hand moving down a column never spends in one place.
 */
export const QuietTip: React.FC<
  React.PropsWithChildren<{ title: React.ReactNode }>
> = ({ title, children }) => (
  <Tooltip
    title={title}
    placement="top"
    disableInteractive
    enterDelay={500}
    enterNextDelay={500}
    leaveDelay={0}
  >
    {children as React.ReactElement}
  </Tooltip>
);

export const ICON_BUTTON_SX = {
  border: 'none',
  background: 'none',
  p: 0.25,
  lineHeight: 0,
  cursor: 'pointer',
  color: 'text.disabled',
  borderRadius: '4px',
  flexShrink: 0,
  textDecoration: 'none',
  display: 'inline-flex',
  '&:hover': { color: '#1565c0', bgcolor: 'rgba(21,101,192,0.08)' },
  '& svg': { fontSize: 14, display: 'block' },
} as const;

/** Copy, on its own, so it can sit at the end of a cluster. */
export const CopyButton: React.FC<{ value: string; label: string }> = ({
  value,
  label,
}) => {
  const [copied, setCopied] = useState(false);
  return (
    <QuietTip title={copied ? 'Copied' : `Copy ${label}`}>
      <Box
        component="button"
        type="button"
        aria-label={`Copy ${label}`}
        onClick={() => {
          navigator.clipboard?.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
        sx={{ ...ICON_BUTTON_SX, ...(copied ? { color: '#1b7f3b' } : {}) }}
      >
        {copied ? <DoneRounded /> : <ContentCopyRounded />}
      </Box>
    </QuietTip>
  );
};

/** A mono value with its copy press — ids, uuids, remote job numbers. */
export const CopyText: React.FC<{
  value: string;
  title?: string;
  /** the identity line wants this smaller and quieter than a fact row */
  quiet?: boolean;
}> = ({ value, title, quiet }) => (
  <Box
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.25,
      minWidth: 0,
    }}
  >
    <QuietTip title={title ?? value}>
      <Box
        component="span"
        sx={{
          fontFamily: 'monospace',
          fontSize: quiet ? '0.66rem' : '0.72rem',
          color: quiet ? 'text.disabled' : 'inherit',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </Box>
    </QuietTip>
    <CopyButton value={value} label={title ?? value} />
  </Box>
);

/** the resolved host account, worn as a chip wherever identity matters */
export const UserChip: React.FC<{ user: string }> = ({ user }) => (
  <Chip
    size="small"
    variant="outlined"
    label={user}
    sx={{
      height: 16,
      fontSize: '0.64rem',
      fontFamily: 'monospace',
      borderRadius: '4px',
      borderColor: '#5f4bb555',
      bgcolor: 'transparent',
      color: '#5f4bb5',
      '& .MuiChip-label': { px: 0.6 },
    }}
  />
);

/** one row of an inner box: small-caps label, value beside it.
 *  `stack` is the jobs-card convention (its Execution/Archive rows) for
 *  list values: the label sits level with the FIRST line instead of
 *  centred on the whole block, and the value stacks as a column. */
export const Fact: React.FC<
  React.PropsWithChildren<{
    label: string;
    when?: boolean;
    stack?: boolean;
    /**
     * A frame of its own, in paper against the section's tint — the job
     * card's Execution and Archive rows. For a value that is a THING with
     * parts (a machine and its directories, a system and its queues)
     * rather than one more label-and-value.
     */
    boxed?: boolean;
  }>
> = ({ label, when = true, stack, boxed, children }) =>
  when ? (
    <Box sx={{ display: 'contents' }}>
      <Typography
        sx={{
          ...LABEL_SX,
          ...(stack && { alignSelf: 'start', pt: '3px' }),
          // the label reads as the box's caption, so it sits level with the
          // box's first line rather than centred on the whole block
          ...(boxed && { alignSelf: 'start', pt: '9px' }),
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          ...VALUE_SX,
          ...(stack && {
            alignSelf: 'start',
            flexDirection: 'column',
            alignItems: 'stretch',
            flexWrap: 'nowrap',
            gap: 0.25,
          }),
          ...(boxed && {
            alignSelf: 'start',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'background.paper',
            px: 1,
            py: 0.75,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  ) : null;

/**
 * The fact boxes, packed so the columns come out level — and, when they
 * come out nearly level, made to line up exactly.
 *
 * They used to sit in `repeat(auto-fit, minmax(340px, 1fr))`, and a CSS
 * grid sizes every row by its tallest cell, so one tall box (the system
 * card's Host & files, say) left a column of white space beside every
 * short one. CSS multi-column fixed that but could not do the last part:
 * multicol has no way to stretch a box, so the shorter column always
 * ended a little high — which on a job page, where the session box is
 * short, is most of what read as "not the same spacing as the others".
 *
 * So: measured columns. A ResizeObserver reports the container's width
 * (the CARD's width, which in a right-hand pane is not the window's) and
 * each box's natural height; mosaic.ts decides the column count, deals
 * the boxes shortest-column-first in source order, and says whether the
 * result is close enough to be worth levelling. When it is, the last box
 * in each column grows into the slack.
 *
 * The first measurement happens in a LAYOUT effect, synchronously, before
 * the browser paints: read the width, re-render at the right column count,
 * read the boxes, re-render packed — all in the frame the card mounts in.
 * A ResizeObserver only reports later changes. Done the other way round
 * (observer first) the card painted its unmeasured round-robin, then
 * re-packed a frame later, and a page that had grown taller in between
 * took the scroll position with it.
 *
 * Without ResizeObserver (jsdom, and any browser old enough to lack it)
 * the boxes still settle — the layout effect does not need one — they
 * just stop responding to later resizes.
 */
/**
 * How long a burst of later resizes is given to finish arriving before the
 * observer commits one settle. Short enough that a single, isolated resize
 * (a user pressing "show all" on a notes box) still reads as instant;
 * long enough to usually catch the handful of independent panel queries
 * that resolve within a beat of each other right after a detail page
 * mounts.
 */
const DEBOUNCE_MS = 120;

/**
 * How long a card is allowed to re-deal its columns before the
 * arrangement is final. Long enough to cover the queries a detail page
 * fires on mount, short enough that it is over before anyone has read far
 * enough to be interrupted by a box moving.
 */
export const SETTLE_MS = 2000;
export const CardMosaic: React.FC<
  React.PropsWithChildren<{ min?: number; sx?: object }>
> = ({ min = MOSAIC_MIN, sx, children }) => {
  const items = React.Children.toArray(children).filter(Boolean);
  const count = items.length;
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const cellRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const [width, setWidth] = React.useState(0);
  const [heights, setHeights] = React.useState<number[]>([]);

  // every box measured at least once — until then there is nothing to
  // pack with, so they deal round-robin
  const known = heights.length === count && heights.every((h) => h > 0);
  // what the card is showing right now, so a settled deal can be kept
  // while the boxes' own contents arrive
  const shownRef = React.useRef<number[][] | undefined>(undefined);
  /**
   * The settling window.
   *
   * A detail card's boxes arrive over a second or so as their queries
   * land, and re-levelling the columns while that happens is worth the
   * movement — nobody is reading yet. The same movement later is not: it
   * shifts a box out from under the cursor, and because a box that
   * changes column changes PARENT, React unmounts and remounts it, so a
   * History box forgets it loaded and an open confirm shuts.
   *
   * So the columns are re-dealt freely for SETTLE_MS and then held. The
   * timer restarts when the box set itself changes, which is the one late
   * event that genuinely deserves a fresh deal: a system whose access
   * probe resolves gains whole boxes.
   */
  const [packHeld, setPackHeld] = React.useState(false);
  React.useEffect(() => {
    setPackHeld(false);
    const timer = setTimeout(() => setPackHeld(true), SETTLE_MS);
    return () => clearTimeout(timer);
  }, [count]);
  const plan = React.useMemo(
    () =>
      known
        ? layOut(heights, width, min, undefined, shownRef.current, packHeld)
        : {
            columns: columnsFor(width, min),
            cols: spreadColumns(count, columnsFor(width, min)),
            match: false,
          },
    [known, heights, width, min, count, packHeld]
  );

  // A stretched box reports ITS stretched height, which would feed back
  // into the packing that stretched it. Its natural height is remembered
  // instead, and its own measurements ignored while it is the one growing.
  const stretched = React.useMemo(() => {
    if (!plan.match) return new Set<number>();
    return new Set(
      plan.cols.map((col) => col[col.length - 1]).filter((i) => i != null)
    );
  }, [plan]);
  shownRef.current = known ? plan.cols : undefined;

  const stretchedRef = React.useRef(stretched);
  stretchedRef.current = stretched;

  /**
   * The pre-paint settle. It runs after every render until the layout is
   * settled and then stops, so a Collapse animating open cannot spin it —
   * that case is the observer's, which is throttled and asynchronous.
   *
   * Two passes by design: the first render has no width, so the boxes are
   * laid out one-column and their heights would be wrong for the packing.
   * Reading the width and returning re-renders at the right column count;
   * the next pass reads heights that mean something. React flushes both
   * before the paint.
   */
  const settled = known && width > 0;
  // insurance: content that cannot hold still (a spinner mid-animation)
  // must not be able to spin the synchronous pass into a render loop
  const passes = React.useRef(0);
  if (settled) passes.current = 0;
  React.useLayoutEffect(() => {
    if (settled || passes.current > 8) return;
    passes.current += 1;
    const host = hostRef.current;
    if (!host) return;
    const measured = Math.round(host.getBoundingClientRect().width);
    if (measured !== width) {
      setWidth(measured);
      return;
    }
    const next = heights.slice();
    next.length = count;
    let changed = false;
    cellRefs.current.slice(0, count).forEach((el, index) => {
      if (!el || stretchedRef.current.has(index)) return;
      const height = Math.round(el.getBoundingClientRect().height);
      if (height > 0 && Math.abs((next[index] ?? 0) - height) > 1) {
        next[index] = height;
        changed = true;
      }
    });
    if (changed) setHeights(next);
  });

  /**
   * Later changes — a panel's own query resolving, a Collapse opening —
   * arrive over the observer, DEBOUNCED. The boxes on these pages fill in
   * from several independent queries (Sharing & access, Notes, the run
   * tiles), each landing in its own network round trip; without this, each
   * arrival committed its own re-pack the instant it was measured, so a
   * page settling from three near-simultaneous responses visibly hopped
   * three times instead of once. Pending measurements accumulate in a ref
   * and commit together once nothing new has arrived for DEBOUNCE_MS — an
   * isolated resize (a user expanding a fold) still reads as instant; a
   * burst reads as one settle instead of several.
   */
  const pendingWidth = React.useRef<number | undefined>(undefined);
  const pendingHeights = React.useRef<Map<number, number>>(new Map());
  const flushTimer = React.useRef<ReturnType<typeof setTimeout>>();
  React.useLayoutEffect(() => {
    if (typeof ResizeObserver === 'undefined') return undefined;
    const host = hostRef.current;
    // A pending measurement is keyed by INDEX, and the boxes behind those
    // indices have just changed — a system whose access resolved gains
    // whole fact boxes, and index 3 is now a different box than the one
    // measured. Anything still in flight is about the old set, so it goes.
    pendingHeights.current = new Map();
    pendingWidth.current = undefined;
    const flush = () => {
      flushTimer.current = undefined;
      if (pendingWidth.current != null) {
        const next = pendingWidth.current;
        pendingWidth.current = undefined;
        setWidth((prev) => (prev === next ? prev : next));
      }
      if (pendingHeights.current.size) {
        const pending = pendingHeights.current;
        pendingHeights.current = new Map();
        setHeights((prev) => {
          const next = prev.slice();
          let changed = false;
          pending.forEach((height, index) => {
            // a pixel of drift is not a reflow worth doing
            if (Math.abs((next[index] ?? 0) - height) > 1) {
              next[index] = height;
              changed = true;
            }
          });
          return changed ? next : prev;
        });
      }
    };
    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const el = entry.target as HTMLElement;
        if (el === host) {
          pendingWidth.current = Math.round(entry.contentRect.width);
          return;
        }
        const index = Number(el.dataset.cell);
        if (Number.isNaN(index) || stretchedRef.current.has(index)) return;
        pendingHeights.current.set(index, Math.round(entry.contentRect.height));
      });
      clearTimeout(flushTimer.current);
      flushTimer.current = setTimeout(flush, DEBOUNCE_MS);
    });
    if (host) observer.observe(host);
    cellRefs.current.forEach((el) => el && observer.observe(el));
    return () => {
      observer.disconnect();
      clearTimeout(flushTimer.current);
    };
  }, [count]);

  return (
    <Box
      ref={hostRef}
      data-mosaic=""
      data-columns={plan.columns}
      data-match={plan.match ? '' : undefined}
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        gap: `${MOSAIC_GAP}px`,
        minWidth: 0,
        ...sx,
      }}
    >
      {plan.cols.map((col, column) => (
        <Box
          // the columns are positions, not content — index is their identity
          // eslint-disable-next-line react/no-array-index-key
          key={column}
          sx={{
            flex: '1 1 0',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: `${MOSAIC_GAP}px`,
          }}
        >
          {col.map((index, at) => {
            const grows = plan.match && at === col.length - 1;
            return (
              <Box
                key={index}
                data-cell={index}
                ref={(el: HTMLDivElement | null) => {
                  cellRefs.current[index] = el;
                }}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  minWidth: 0,
                  ...(grows
                    ? // the slack goes into the last box, and the box's own
                      // content stays where it was — a taller frame, not
                      // re-centred contents
                      { flexGrow: 1, '& > *': { flex: '1 1 auto' } }
                    : { flexGrow: 0 }),
                }}
              >
                {items[index]}
              </Box>
            );
          })}
        </Box>
      ))}
    </Box>
  );
};

/**
 * The inner box — the same bordered section the job card keeps its facts
 * in. `state` puts the box's yes/no on its title line: job execution and
 * batch are capabilities a system either has or does not. `actions` sits
 * at the title line's right edge for the box's own small controls.
 *
 * A box whose `state` is no keeps its title and drops its body: a system
 * that runs no jobs has nothing to say under "Job execution", and a full
 * height of empty rows there is what unbalanced the card.
 */
export const InnerBox: React.FC<
  React.PropsWithChildren<{
    title: string;
    state?: boolean;
    actions?: React.ReactNode;
    footer?: React.ReactNode;
    /** what to say instead of the body when `state` is no */
    whenNo?: React.ReactNode;
  }>
> = ({ title, state, actions, footer, whenNo, children }) => (
  <Box
    sx={{
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 1,
      // tinted against the card's paper, the way the job card's Details box
      // is — a section you can see the edges of without counting borders
      bgcolor: SECTION_BG,
      p: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 0.75,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      <Typography sx={{ fontSize: '0.78rem', fontWeight: 700 }}>
        {title}
      </Typography>
      {state != null && (
        <Typography
          sx={{
            fontSize: '0.68rem',
            fontWeight: 600,
            color: state ? '#1b7f3b' : 'text.disabled',
          }}
        >
          {state ? 'yes' : 'no'}
        </Typography>
      )}
      {actions && (
        <Box
          sx={{
            ml: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            flexShrink: 0,
          }}
        >
          {actions}
        </Box>
      )}
    </Box>
    {state === false ? (
      whenNo && (
        <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
          {whenNo}
        </Typography>
      )
    ) : (
      <>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'max-content minmax(0, 1fr)',
            columnGap: 1.25,
            rowGap: 0.5,
            alignItems: 'center',
          }}
        >
          {children}
        </Box>
        {footer && (
          <Box
            sx={{
              display: 'flex',
              gap: 0.75,
              alignItems: 'center',
              mt: 'auto',
            }}
          >
            {footer}
          </Box>
        )}
      </>
    )}
  </Box>
);
