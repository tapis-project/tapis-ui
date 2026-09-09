/**
 * TableShell — the one frame every landing table sits in.
 *
 * It replaced the TableTopRail + TableFacts pair. The rail was a loose row
 * floating between the stat tiles and the table, and the facts were a
 * separate footer strip — two homes for what is really one strip of words
 * and presses. Now there is one strip, worn INSIDE the table's frame, and
 * a preference says which edge it sits on:
 *
 *   bottom (default) — the footer strip: facts + transient hint on the
 *                      left, columns / ⓘ / density on the right. Nothing
 *                      at all between the tiles and the header row.
 *   top              — the same strip as a header row atop the table.
 *
 * Three more preferences shape it: tables.fit decides how the table
 * meets the window ('flow' grows with the rows and lets the page scroll,
 * 'pinned' caps the frame at the window's bottom edge and scrolls its
 * own rows under a sticky header); tables.style picks how much frame it
 * wears ('plain' — no header wash, no per-row rules, the look the
 * in-card tables have always had — or 'framed'); and tables.titles says
 * whether the table names itself inside its own frame.
 */
import React, { useCallback, useLayoutEffect, useState } from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { SURFACE, WELL } from './overviewKit';
import {
  DensityButton,
  RAIL_BTN_SX,
  RAIL_TEXT_SX,
  useTableDensity,
} from './tableRail';
import {
  CAPPED_ROWS,
  explorerMinRows,
  pinGap,
  tableChromePlacement,
  tableFit,
  tableStyle,
  tableTitles,
} from './viewPrefs';

// ── pinning: cap an element at the window's bottom edge ────────────────────

/** the shell's scrolling pane (.work-content), found rather than assumed */
const findScrollParent = (el: HTMLElement): HTMLElement | null => {
  for (let parent = el.parentElement; parent; parent = parent.parentElement) {
    const overflowY = window.getComputedStyle(parent).overflowY;
    if (overflowY === 'auto' || overflowY === 'scroll') return parent;
  }
  return null;
};

/**
 * The geometry knobs are preferences now — pinGap (the visible daylight
 * under a pinned surface) and explorerMinRows (the rows an inline
 * explorer reserves before the page scrolls instead), both in viewPrefs
 * and both on the Settings page. What stays code-side:
 */

/** never squash a pinned table into uselessness on a short window */
const MIN_CAP = 180;
/** a nominal listing row (compact density), for turning rows into px */
const EXPLORER_ROW_PX = 28;
/** the same measure for a landing table's own rows, per density */
const ROW_PX_COMPACT = 26;
const ROW_PX_COMFORTABLE = 34;
/** its header row plus the strip, roughly */
const HEAD_PX = 62;
/** the listing's header row + status line, roughly */
const EXPLORER_CHROME_PX = 56;

/**
 * The measured height that fits the element into whatever the content
 * above it leaves of the pane — its bottom lands PIN_BOTTOM_GAP above
 * the bar and the page has nothing left to scroll. One computation, two
 * floors:
 *
 *   'table'    — a landing table under its tiles; floors at MIN_CAP so a
 *                short window still shows a few rows.
 *   'explorer' — an inline file browser under a page's cards; floors at
 *                the explorerMinRows preference — when the cards eat 90%
 *                of the pane, the explorer reserves that many rows and
 *                the page scrolls the difference rather than serving a
 *                porthole. The ceiling is the whole pane, which is what
 *                a short page gives it. The floor RESERVES space; the
 *                consumers apply the cap as max-height, so a directory
 *                with three files renders three files tall.
 *
 * Re-measured on window resize and — the answer depends on everything
 * above the element — whenever the pane's content resizes; the two
 * geometry preferences re-measure live too.
 */
export const usePinnedCap = (pinned: boolean, mode: 'table' | 'explorer') => {
  // a callback ref held as state: the measuring effect re-runs whenever the
  // element actually attaches, so a late-mounting section (a job's output
  // browser arriving after the fetch) can never miss its measurement
  const [el, setEl] = useState<HTMLElement | null>(null);
  const ref = useCallback((node: HTMLElement | null) => setEl(node), []);
  const [cap, setCap] = useState<number | undefined>(undefined);
  const gap = parseFloat(pinGap.use());
  const minRows = parseInt(explorerMinRows.use(), 10);

  useLayoutEffect(() => {
    if (!pinned || !el) {
      setCap(undefined);
      return undefined;
    }
    const scroller = findScrollParent(el);

    const measure = () => {
      const viewport = scroller ? scroller.clientHeight : window.innerHeight;
      const hostTop = scroller ? scroller.getBoundingClientRect().top : 0;
      const scrollTop = scroller ? scroller.scrollTop : window.scrollY;
      // the element's place in the pane's CONTENT, so a half-scrolled
      // pane measures the same as a resting one
      const top = el.getBoundingClientRect().top - hostTop + scrollTop;
      // What actually sits under the element (the page's own tail
      // padding, mostly) — measured from the content's true bottom edge
      // via child rects. NOT scrollHeight: that clamps to clientHeight,
      // so once pinning made the content shorter than the pane, every
      // re-measure read the clamp as real content and shaved the cap by
      // the gap again — a slow ratchet down to the floor.
      let below = 0;
      if (scroller) {
        let contentBottom = -Infinity;
        for (const child of Array.from(scroller.children)) {
          contentBottom = Math.max(
            contentBottom,
            child.getBoundingClientRect().bottom
          );
        }
        if (Number.isFinite(contentBottom)) {
          below = Math.max(
            0,
            contentBottom - el.getBoundingClientRect().bottom
          );
        }
      }
      // the VISIBLE gap is the larger of the page's own tail and the
      // knob — subtracting both stacked them (16px of pb under a 6px
      // gap read as ~22px of daylight on screen)
      const next = viewport - top - Math.max(below, gap);
      // floor, not round: the content bottom sits flush against the pane
      // when it fits, and rounding up by half a pixel would leave a
      // one-pixel scrollbar behind
      const settled = Math.max(
        Math.floor(next),
        mode === 'explorer'
          ? EXPLORER_CHROME_PX + minRows * EXPLORER_ROW_PX
          : MIN_CAP
      );
      // fractional rects re-round after the cap applies; a 1px wobble must
      // not ping-pong through the resize observer forever
      setCap((prev) =>
        prev !== undefined && Math.abs(prev - settled) <= 1 ? prev : settled
      );
    };

    measure();
    // observer callbacks re-measure on the next frame — reading layout
    // synchronously inside ResizeObserver is how its loop warning happens
    let frame: number | undefined;
    const queue = () => {
      if (frame !== undefined) return;
      frame = requestAnimationFrame(() => {
        frame = undefined;
        measure();
      });
    };
    window.addEventListener('resize', queue);
    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined' && scroller) {
      observer = new ResizeObserver(queue);
      observer.observe(scroller);
      // the fit depends on the height of everything above the element —
      // tiles filling in, cards arriving — all inside this child
      if (scroller.firstElementChild) {
        observer.observe(scroller.firstElementChild);
      }
    }
    return () => {
      window.removeEventListener('resize', queue);
      if (frame !== undefined) cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [pinned, mode, el, gap, minRows]);

  return { ref, cap: pinned ? cap : undefined };
};

// ── the window line ────────────────────────────────────────────────────────

/**
 * The one fact the strip owes a reader: this table is a window, and here is
 * how to widen it.
 *
 * Four landing tables each wrote their own version of this, and they had
 * drifted into four different sentences — one of which rendered "Window:
 * the 0 loaded apps of more" before the first page arrived. So it is one
 * function, and everything that was standing explanation ("the counts are
 * computed from that window", "runs counted from the last N jobs") moved
 * behind each table's ⓘ, where a standing explanation belongs.
 *
 * Nothing at all when the window holds everything: the caveat exists only
 * because rows are missing, so with none missing there is nothing to say.
 */
export const windowFacts = (
  count: number,
  noun: string,
  spine?: {
    meta: { truncated?: boolean; total?: number };
    windowSize: number;
  }
): string | undefined => {
  if (!spine?.meta.truncated) return undefined;
  const grow = `The nav's +${spine.windowSize} loads more`;
  // "of more" is not a number — without a total, say what we do know
  return spine.meta.total
    ? `Window: ${count} of ${spine.meta.total} ${noun}. ${grow}`
    : `Window: ${count} ${noun} loaded. ${grow}`;
};

// ── the shell ──────────────────────────────────────────────────────────────

export const TableShell: React.FC<{
  /** what this table is, named inside its own frame — the in-card
   *  convention ("Recent runs"), behind the tables.titles preference */
  title?: React.ReactNode;
  /** transient only — loading copy, "filtered by …". Omit at rest. */
  hint?: React.ReactNode;
  /** the standing explanation of how this table behaves, behind the ⓘ */
  about?: string;
  /** table-specific presses — a columns menu, a filter chip row */
  controls?: React.ReactNode;
  /** the read's failure — rows already painted stay, and this says why */
  error?: Error | null;
  /** the provenance line — "Window: the 46 most recent …" */
  facts?: React.ReactNode;
  /** the <table> itself */
  children: React.ReactNode;
}> = ({ title, hint, about, controls, error, facts, children }) => {
  const placement = tableChromePlacement.use();
  const fit = tableFit.use();
  const plain = tableStyle.use() === 'plain';
  const titled = tableTitles.use() === 'shown' && !!title;
  const { ref, cap: measured } = usePinnedCap(fit === 'pinned', 'table');
  // 'capped' asks for the same self-scrolling frame as 'pinned' without
  // the measuring: the same number of rows on every screen, and a height
  // that does not shift as the cards above it finish loading
  const density = useTableDensity();
  const cap =
    fit === 'capped'
      ? CAPPED_ROWS *
          (density === 'comfortable' ? ROW_PX_COMFORTABLE : ROW_PX_COMPACT) +
        HEAD_PX
      : measured;
  // both capped modes scroll their own rows under a sticky header
  const scrolls = fit === 'pinned' || fit === 'capped';

  const strip = (
    <Box
      sx={{
        flexShrink: 0,
        [placement === 'top' ? 'borderBottom' : 'borderTop']: '1px solid',
        borderColor: 'divider',
        bgcolor: 'rgba(0,0,0,0.02)',
        px: 1,
        py: 0.5,
      }}
    >
      {error && (
        <Typography sx={{ fontSize: '0.64rem', color: '#9a5b00', mb: 0.25 }}>
          Could not refresh this table, showing what already loaded. The service
          said: {error.message.slice(0, 160)}
        </Typography>
      )}
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: 1, minHeight: 20 }}
      >
        {/* one line at a time. A transient hint REPLACES the window facts
            rather than joining them with a dash: "fetching apps — <quip> —
            Window: 0 of more — …" was three clauses about three different
            things, and the facts are back the instant the load ends. */}
        <Typography sx={{ ...RAIL_TEXT_SX, flex: 1 }}>
          {hint ? (
            <Box component="span" sx={{ color: '#5f4bb5', fontWeight: 600 }}>
              {hint}
            </Box>
          ) : (
            facts
          )}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            flexShrink: 0,
          }}
        >
          {controls}
          {about && (
            <Tooltip title={about} describeChild>
              <Box
                component="button"
                type="button"
                aria-label="About this table"
                sx={RAIL_BTN_SX}
              >
                <InfoOutlined />
              </Box>
            </Tooltip>
          )}
          <DensityButton />
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box
      ref={ref}
      // says in devtools (and in tests) whether the cap actually engaged
      data-pinned={scrolls && cap ? '' : undefined}
      data-fit={fit}
      // the measured (or fixed) height, readable in devtools and in tests —
      // the sx below compiles to a class, so there is no inline style to read
      data-cap={scrolls && cap ? String(cap) : undefined}
      sx={{
        ...WELL,
        p: 0,
        overflow: 'hidden',
        ...(scrolls && cap
          ? { maxHeight: cap, display: 'flex', flexDirection: 'column' }
          : {}),
      }}
    >
      {/* the table names itself, the way the in-card tables do. Above
          the strip when the strip is on top, so the name always leads. */}
      {titled && (
        <Box
          sx={{
            flexShrink: 0,
            px: 1,
            pt: 0.75,
            pb: 0.5,
            ...(placement === 'top' && {
              borderBottom: 'none',
            }),
          }}
        >
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 700 }}>
            {title}
          </Typography>
        </Box>
      )}
      {placement === 'top' && strip}
      <Box
        sx={{
          ...(scrolls && {
            // basis 'auto', so a short table keeps its natural height
            // instead of stretching an empty frame to the cap
            minHeight: 0,
            flexShrink: 1,
            flexBasis: 'auto',
            overflow: 'auto',
            // the header holds while the rows scroll under it; solid
            // paint because rows showing through a translucent header
            // read as smear
            '& thead th': {
              position: 'sticky',
              top: 0,
              zIndex: 2,
              bgcolor: plain ? SURFACE : '#f6f6f4',
              boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.12)',
            },
          }),
          // 'plain' takes the frame off the table itself — no washed
          // header band, no rule under every row — the look the in-card
          // tables have always had. The head keeps one hairline under it
          // so a scrolled pinned table still has something to sit
          // against; the rows carry themselves.
          ...(plain && {
            '& thead': { bgcolor: 'transparent' },
            '& thead th': {
              ...(scrolls && {
                position: 'sticky',
                top: 0,
                zIndex: 2,
                bgcolor: SURFACE,
              }),
              boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.10)',
            },
            '& tbody tr': { borderTop: 'none' },
          }),
        }}
      >
        {children}
      </Box>
      {placement === 'bottom' && strip}
    </Box>
  );
};
