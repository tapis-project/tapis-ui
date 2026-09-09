import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Chip,
  Divider,
  IconButton,
  ListItemButton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  CloseRounded,
  KeyboardArrowDownRounded,
  KeyboardArrowUpRounded,
  InfoOutlined,
} from '@mui/icons-material';
import {
  ACCENT,
  HEAD_BTN_SX,
  PAGE_BG,
  PanelGroup,
  PanelSection,
  SectionBadge,
  SectionHeader,
} from './panelKit';
import StepPager from './StepPager';
import {
  PagerCountdown,
  PagerFlashHandle,
  WHEEL_STREAK_RESET_MS,
  chargeOf,
  countdownOf,
  usePagerGlow,
} from './pagerGlow';

export type { PanelGroup, PanelSection } from './panelKit';

// The two-pane modal-panel mechanics shared by Settings and Pods Admin:
// grouped nav on the left selects ONE section rendered on the right
// (instant, nothing else mounted), ↑↓/PageUp/PageDown/Home/End step
// sections from anywhere inside, and wheeling past a section's scroll edge
// pages into the neighbor — with nested scrollers (e.g. a bounded audit
// list) respected: the panel only pages once the inner scroller is itself
// out of room. A guided walk (the creators) adds a pager of its own: see
// `walk`.

// Wheel paging: once every scroller under the cursor sits at its edge, this
// much additional wheel delta counts as one flick toward the neighboring
// section; the cooldown swallows trackpad momentum so one gesture can't
// double-fire.
const WHEEL_PAGE_THRESHOLD = 90;
// Dead time right after a page lands. Only long enough to swallow the tail of
// the flick that caused it — the streak has already been reset, so that tail
// would have to earn a fresh count, and then the full set again, to page twice.
// Anything longer reads as the panel having frozen on arrival.
const WHEEL_COOLDOWN_MS = 140;
// A flick ends when the wheel goes quiet for this long. Trackpad momentum
// keeps firing for a few hundred ms after the fingers lift, so anything
// shorter would score one flick as several.
const WHEEL_GESTURE_GAP_MS = 260;
// (WHEEL_STREAK_RESET_MS lives in pagerGlow: the countdown holds as long.)
// One unbroken scroll never goes quiet, so it would otherwise score a single
// flick and stall. Keep pushing and this much further delta counts as the next
// one — more travel than a deliberate flick asks for, so momentum alone is
// unlikely to spend the whole streak.
const WHEEL_CONTINUOUS_THRESHOLD = 200;

// The plain ↑↓ pair, for every panel that is not a walk. Its glow state lives
// behind an imperative handle (see pagerGlow), so per-wheel-tick feedback
// never re-renders the panel (or the section body).
const PagerArrows = React.forwardRef<
  PagerFlashHandle,
  { arrowAccent: string; onStep: (delta: number) => void }
>(({ arrowAccent, onStep }, ref) => {
  const glow = usePagerGlow(ref);

  // Color lives on the glyph only, ramping with strength — no halos/scale:
  // filters repaint on every wheel tick and stutter. The one exception is the
  // completing flick (strength 1), which gets a glow that fires once per page
  // rather than once per tick.
  const arrowSx = (dir: 'up' | 'down') => {
    const on = glow?.dir === dir;
    const s = on && glow ? glow.strength : 0;
    return {
      p: 0.25,
      color: on ? alpha(arrowAccent, 0.45 + 0.55 * s) : 'text.disabled',
      textShadow: on && s >= 1 ? `0 0 10px ${alpha(arrowAccent, 0.9)}` : 'none',
      transition: 'color 100ms, text-shadow 200ms',
    };
  };

  const countdown = countdownOf(glow);

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0}
      sx={{ px: 1, py: 0.5 }}
    >
      <Tooltip title="Previous section (↑, or wheel up at the top)">
        <IconButton size="small" onClick={() => onStep(-1)} sx={arrowSx('up')}>
          <KeyboardArrowUpRounded fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Next section (↓, or wheel down at the bottom)">
        <IconButton
          size="small"
          onClick={() => onStep(1)}
          sx={{ ...arrowSx('down'), ml: -0.75 }}
        >
          <KeyboardArrowDownRounded fontSize="small" />
        </IconButton>
      </Tooltip>
      {countdown ? (
        <PagerCountdown
          text={countdown}
          charge={chargeOf(glow)}
          accent={arrowAccent}
          ml={0.5}
        />
      ) : (
        <Typography variant="caption" color="text.disabled" sx={{ pl: 0.5 }}>
          wheel / ↑↓ page sections
        </Typography>
      )}
    </Stack>
  );
});
PagerArrows.displayName = 'PagerArrows';

// True while an inner scrollable between the wheel target and the content
// pane can still move in the wheel direction — the panel must not page then.
const nestedScrollBlocks = (
  target: HTMLElement | null,
  root: HTMLElement,
  deltaY: number
) => {
  let el = target;
  while (el && el !== root) {
    if (el.scrollHeight > el.clientHeight + 1) {
      const canDown = el.scrollTop + el.clientHeight < el.scrollHeight - 1;
      const canUp = el.scrollTop > 1;
      if ((deltaY > 0 && canDown) || (deltaY < 0 && canUp)) return true;
    }
    el = el.parentElement;
  }
  return false;
};

export interface SectionedPanelProps {
  /** Already visibility-filtered; one array drives nav AND content. */
  groups: PanelGroup[];
  title: string;
  caption?: React.ReactNode;
  /** Right side of the header row (chips, toggles, spinners). */
  headerExtras?: React.ReactNode;
  /** Full-width strip between header and panes (e.g. preview banner). */
  banner?: React.ReactNode;
  accent?: string;
  arrowAccent?: string;
  onClose?: () => void;
  initialSection?: string;
  onSectionChange?: (id: string) => void;
  /**
   * Programmatic navigation from inside a section body ("show me that in the
   * Workloads section"). The nonce is what lets the SAME id be requested more
   * than once — without it a second request to an already-open section is
   * indistinguishable from no request.
   */
  sectionRequest?: { id: string; nonce: number };
  /**
   * Keep VISITED sections mounted (hidden) instead of remounting on every
   * switch — returning to a chart-heavy section (metrics, bench) becomes
   * instant because the canvases and queries survive. Off by default:
   * hidden sections keep their subscriptions running. Hosts whose dialog
   * unmounts on close (node detail) can just set this; keepMounted dialog
   * hosts (Settings, Pods Admin) must ALSO pass `open` so a closed modal
   * prunes back to the single active section.
   */
  keepAlive?: boolean;
  /**
   * Bottom strip of the nav column — panel switcher + persistent actions
   * (see PanelFooter). Sits below the section list and above nothing; the
   * pager arrows move above it so both stay reachable.
   */
  footer?: React.ReactNode;
  /**
   * For keepMounted dialog hosts: the dialog's open state. While false the
   * visited set prunes to just the active section — a closed modal costs
   * exactly what it did before keepAlive existed. Defaults to true
   * (embedded/route hosts are always "open"; they unmount on nav away).
   * Also feeds SectionActiveContext, so sections can pause work while
   * hidden or closed.
   */
  open?: boolean;
  /**
   * Optional third column on the right — a summary, a preview, anything that
   * should stay visible while you work through the sections. Omitted by every
   * panel that does not want one, so the two-pane layout is unchanged.
   */
  aside?: React.ReactNode;
  /** Widen the nav when its items carry detail. Default 190. */
  navWidth?: number;
  /**
   * Section `detail` nodes hide behind a small ⓘ toggle in the header,
   * default OFF, remembered per panel title — the compact nav is the resting
   * state and the descriptions are the help layer. A host whose details are
   * governed by its own control (the launcher's summary-mode switch) sets
   * this false to always render whatever details it passes.
   */
  navDetailsToggle?: boolean;
  /**
   * Whether the toggle starts on, for a panel whose nav is meant to double as
   * the overview from the first paint. Only the FIRST visit obeys it: once
   * someone has pressed the toggle, their answer is the one that is
   * remembered, which is the point of a toggle.
   */
  navDetailsDefault?: boolean;
  /**
   * Bumped by a host that wants the nav's problem badges noticed: every
   * change glows each red or amber count once, so "where are the problems"
   * is answered by the list itself.
   */
  badgePulse?: number;
  /**
   * How many separate wheel flicks at a section's edge page into the neighbour.
   * 1 (the default) is the original single-flick feel; a panel that is easy to
   * page through by accident — a long form you scroll to the bottom of — asks
   * for more, and the arrows count the flicks down as they land.
   */
  pageGestures?: number;
  /**
   * A guided walk (the creators): the sections are steps, taken in order.
   *
   * The shell's ↑↓ pair grows into the walk's pager, pinned under the nav
   * list: ▲ Back beside a blue ▼ Continue, then the panel's view switches,
   * the step and the skip in one row beneath. The wheel and the arrow keys
   * page exactly as in any other panel, and charge its presses as they go.
   */
  walk?: {
    /** grey "skip to …" under Continue: where it lands, and what it says */
    skipTo?: { id: string; label: string };
    /**
     * The host's own switches for that row, e.g. the launcher's in-nav
     * summary. The shell's ⓘ details toggle moves down there too, so a
     * guided creator keeps its view switches beside its pager rather than
     * in the head line.
     */
    tools?: React.ReactNode;
    /**
     * The host's own press for the pager's second row, instead of the
     * default skip: the launcher's Review & submit, which also rings the
     * button that submits.
     */
    action?: React.ReactNode;
  };
}

// True when the consuming section is the one on screen AND the host is open.
// Sections with genuinely live work (polling health reads, tickers) consume
// this to pause while hidden — the query-cache warmth keepAlive exists for
// is preserved either way.
export const SectionActiveContext = React.createContext(true);
export const useSectionActive = () => React.useContext(SectionActiveContext);

const SectionedPanel: React.FC<SectionedPanelProps> = ({
  groups,
  title,
  caption,
  headerExtras,
  banner,
  accent = ACCENT,
  arrowAccent = '#7c4dff',
  onClose,
  initialSection,
  onSectionChange,
  sectionRequest,
  keepAlive = false,
  footer,
  open = true,
  pageGestures = 1,
  walk,
  aside,
  navWidth = 190,
  navDetailsToggle = true,
  navDetailsDefault = false,
  badgePulse = 0,
}) => {
  const visibleGroups = groups.filter((g) => g.items.length > 0);
  const visibleSections = visibleGroups.flatMap((g) => g.items);
  const hasDetails = visibleSections.some((sec) => sec.detail);
  const detailsKey = `sectioned-nav-details:${title}`;
  const [showNavDetails, setShowNavDetails] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(detailsKey);
      return stored === null ? navDetailsDefault : stored === '1';
    } catch {
      return navDetailsDefault;
    }
  });
  const detailsOn = navDetailsToggle ? showNavDetails : true;
  const toggleNavDetails = () => {
    setShowNavDetails((v) => {
      try {
        localStorage.setItem(detailsKey, v ? '0' : '1');
      } catch {
        /* private mode — the toggle just won't persist */
      }
      return !v;
    });
  };
  // Details need room; the resting nav does not. Widening only while they
  // show keeps the default compact column everyone is used to.
  const effectiveNavWidth =
    detailsOn && hasDetails ? Math.max(navWidth, 250) : navWidth;
  const theme = useTheme();
  // The nav column is CSS-hidden below sm and a walk's pager lives in it, so
  // the pager has to know when to come out and sit under the form instead.
  const narrow = useMediaQuery(theme.breakpoints.down('sm'));

  // Selection is instant — one section mounted at a time. selectedId may
  // point at a section not currently present; derive with a fallback instead
  // of clamping state so the choice survives visibility changes.
  const [selectedId, setSelectedId] = useState(
    initialSection ?? visibleSections[0]?.id ?? ''
  );
  const selected =
    visibleSections.find((s) => s.id === selectedId) ?? visibleSections[0];

  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  // keepAlive: which sections have been shown at least once. Idempotent
  // add-during-render on purpose — an effect would cost one extra render per
  // first visit for no benefit.
  const visitedRef = useRef<Set<string>>(new Set());
  // keepAlive, part two: the ELEMENT each mounted section last rendered.
  // Without this, every visited section's render() runs on every switch, so
  // paging got MORE expensive the more of the panel you'd seen. Re-handing
  // React the identical element object makes it skip that subtree entirely,
  // so a switch re-renders exactly one section. Inactive sections freeze at
  // their last render — which is what hidden means; anything that must keep
  // moving reads useSectionActive() and is active by definition.
  const frozenRef = useRef<Map<string, React.ReactNode>>(new Map());
  const arrowsRef = useRef<PagerFlashHandle>(null);
  // Where the incoming section's content pane should land: 'bottom' when the
  // user pages upward with the wheel, so the flow reads as one continuous
  // scroll; everything else arrives at the top.
  const arriveAt = useRef<'top' | 'bottom'>('top');
  // Wheel paging state. `wheelAccum` charges within ONE flick; `gestureCount`
  // is how many flicks of the current streak have landed.
  const wheelAccum = useRef(0);
  const wheelCooldownUntil = useRef(0);
  const gestureCount = useRef(0);
  const gestureDir = useRef<'up' | 'down' | null>(null);
  const gestureCounted = useRef(false);
  const lastWheelAt = useRef(0);
  const deltaSinceCount = useRef(0);

  const select = (id: string, arrive: 'top' | 'bottom' = 'top') => {
    arriveAt.current = arrive;
    setSelectedId(id);
    onSectionChange?.(id);
  };

  const step = (delta: number, arrive: 'top' | 'bottom' = 'top') => {
    if (!selected) return;
    arrowsRef.current?.flash(delta > 0 ? 'down' : 'up', 1);
    const idx = visibleSections.findIndex((s) => s.id === selected.id);
    const next = visibleSections[idx + delta];
    if (next) select(next.id, arrive);
  };

  // Arrow keys switch sections from anywhere inside the panel (the handler
  // sits on the root, so it works no matter which child holds focus).
  const onPanelKeyDown = (e: React.KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const target = e.target as HTMLElement;
    // keys pressed in a portaled overlay are that overlay's (see the wheel)
    if (!e.currentTarget.contains(target)) return;
    if (
      /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) ||
      target.isContentEditable
    )
      return;
    const actions: Record<string, () => void> = {
      ArrowDown: () => step(1),
      ArrowUp: () => step(-1),
      PageDown: () => step(1),
      PageUp: () => step(-1),
      Home: () => {
        if (visibleSections[0]) {
          arrowsRef.current?.flash('up', 1);
          select(visibleSections[0].id);
        }
      },
      End: () => {
        if (visibleSections.length > 0) {
          arrowsRef.current?.flash('down', 1);
          select(visibleSections[visibleSections.length - 1].id);
        }
      },
    };
    const action = actions[e.key];
    if (action) {
      e.preventDefault();
      action();
    }
  };

  const resetWheelStreak = () => {
    wheelAccum.current = 0;
    gestureCount.current = 0;
    gestureCounted.current = false;
    gestureDir.current = null;
    deltaSinceCount.current = 0;
  };

  // Wheeling past a section's scroll edge pages into the neighbor. Only
  // observes — never preventDefault — so in-section scrolling stays native.
  //
  // Paging takes `pageGestures` separate flicks, not one long scroll: a flick
  // is a burst of wheel events carrying WHEEL_PAGE_THRESHOLD of delta, and
  // going quiet for WHEEL_GESTURE_GAP_MS ends it. Counting flicks rather than
  // raw delta is what makes "three scrolls" mean the same thing on a mouse
  // wheel (few big deltas) and a trackpad (many small ones, plus momentum).
  const onContentWheel = (e: React.WheelEvent) => {
    const el = contentRef.current;
    if (!el) return;
    // A modal or menu opened from a section lives in a portal: its events
    // bubble up the React tree to here, but it is not inside the pane. Paging
    // on them turned a scroll in a file browser into a page turn, which
    // unmounted the section and closed the browser with it.
    if (!el.contains(e.target as Node)) return;
    const now = performance.now();
    if (now < wheelCooldownUntil.current) return;
    if (nestedScrollBlocks(e.target as HTMLElement, el, e.deltaY)) {
      resetWheelStreak();
      return;
    }
    const atTop = el.scrollTop <= 1;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
    const dir: 'up' | 'down' | null =
      e.deltaY > 0 && atBottom ? 'down' : e.deltaY < 0 && atTop ? 'up' : null;

    if (!dir) {
      resetWheelStreak();
      // gentle direction cue even mid-content, so the mechanic is discoverable
      if (e.deltaY !== 0)
        arrowsRef.current?.flash(e.deltaY > 0 ? 'down' : 'up', 0.35);
      return;
    }

    // Turning around, or coming back much later, starts the count over
    const quiet = now - lastWheelAt.current;
    if (dir !== gestureDir.current || quiet > WHEEL_STREAK_RESET_MS) {
      resetWheelStreak();
      gestureDir.current = dir;
    } else if (quiet > WHEEL_GESTURE_GAP_MS) {
      // the previous flick ended; this event opens a new one
      wheelAccum.current = 0;
      gestureCounted.current = false;
    }
    lastWheelAt.current = now;

    wheelAccum.current += Math.abs(e.deltaY);
    deltaSinceCount.current += Math.abs(e.deltaY);
    const needed = Math.max(1, pageGestures);

    // A flick counts when it carries the threshold; an unbroken scroll counts
    // again every WHEEL_CONTINUOUS_THRESHOLD of further travel, so holding the
    // wheel down keeps making progress instead of stalling until you stop.
    const counts = gestureCounted.current
      ? deltaSinceCount.current >= WHEEL_CONTINUOUS_THRESHOLD
      : wheelAccum.current >= WHEEL_PAGE_THRESHOLD;

    if (counts) {
      gestureCounted.current = true;
      gestureCount.current += 1;
      deltaSinceCount.current = 0;
      if (gestureCount.current >= needed) {
        wheelCooldownUntil.current = now + WHEEL_COOLDOWN_MS;
        resetWheelStreak();
        // step() flashes at full strength — that is the completing glow
        step(dir === 'down' ? 1 : -1, dir === 'down' ? 'top' : 'bottom');
        return;
      }
    }

    // Charge ramps across the whole streak: landed flicks plus progress toward
    // the next one, so the glyph keeps brightening whether you flick again or
    // just keep scrolling, and the caption steps down 2 → 1.
    const partial = gestureCounted.current
      ? Math.min(1, deltaSinceCount.current / WHEEL_CONTINUOUS_THRESHOLD)
      : Math.min(1, wheelAccum.current / WHEEL_PAGE_THRESHOLD);
    const charge = (gestureCount.current + partial) / needed;
    arrowsRef.current?.flash(
      dir,
      0.35 + 0.6 * charge,
      needed - gestureCount.current
    );
  };

  // Land the new section's content where the navigation gesture implies.
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    el.scrollTop = arriveAt.current === 'bottom' ? el.scrollHeight : 0;
    arriveAt.current = 'top';
  }, [selected?.id]);

  // A section body asked to move the panel (e.g. "run this for real" jumping
  // from the lab to the workload form).
  useEffect(() => {
    if (sectionRequest?.id) select(sectionRequest.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionRequest?.id, sectionRequest?.nonce]);

  // Arrows should work the moment the panel appears — no click required.
  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true });
  }, []);

  // The ⓘ switch for the nav's detail lines. In the head line normally; a
  // walk carries it in the row under its pager instead.
  const detailsToggle = hasDetails && navDetailsToggle && (
    <Tooltip
      title={
        detailsOn
          ? 'Hide the section descriptions in the nav'
          : 'What does each section do? Show a line under every nav item'
      }
    >
      <IconButton
        size="small"
        onClick={toggleNavDetails}
        aria-label="Toggle section descriptions"
        sx={{ color: detailsOn ? accent : 'text.disabled' }}
      >
        <InfoOutlined sx={{ fontSize: 16 }} />
      </IconButton>
    </Tooltip>
  );

  // The walk's pager, read off the same list the nav draws, so Back and
  // Continue cannot disagree with the order on screen. It takes the plain
  // pair's place and its handle, so the wheel and the keys charge and flash
  // its presses. The switches ride in its second row wherever there is a nav
  // for them to act on; under the form on a phone there is not.
  const walkPager = () => {
    if (!walk || !selected) return null;
    const index = visibleSections.findIndex((s) => s.id === selected.id);
    const previous = visibleSections[index - 1];
    const following = visibleSections[index + 1];
    const skip =
      walk.skipTo &&
      walk.skipTo.id !== selected.id &&
      visibleSections.some((s) => s.id === walk.skipTo?.id)
        ? walk.skipTo
        : undefined;
    const switches =
      !narrow && (detailsToggle || walk.tools) ? (
        <>
          {detailsToggle}
          {walk.tools}
        </>
      ) : undefined;
    return (
      <Box
        sx={{
          flexShrink: 0,
          borderTop: '1px solid',
          borderColor: 'divider',
          px: 1.25,
          pt: 1,
          pb: 0.75,
        }}
      >
        <StepPager
          ref={arrowsRef}
          stepOf={index + 1}
          total={visibleSections.length}
          // through step(), so a press flashes the way a key or a flick does
          back={previous && { label: previous.label, onGo: () => step(-1) }}
          next={following && { label: following.label, onGo: () => step(1) }}
          skip={
            skip && {
              label: skip.label,
              onGo: () => {
                arrowsRef.current?.flash('down', 1);
                select(skip.id);
              },
            }
          }
          tools={switches}
          action={walk.action}
        />
      </Box>
    );
  };

  const navItem = (s: PanelSection) => {
    const active = selected?.id === s.id;
    return (
      <ListItemButton
        key={s.id}
        dense
        aria-current={active ? 'true' : undefined}
        onClick={() => select(s.id)}
        sx={{
          borderLeft: '2px solid',
          borderLeftColor: active ? accent : 'transparent',
          borderRadius: '0 6px 6px 0',
          py: s.detail && detailsOn ? 0.35 : 0.5,
          px: 1.25,
          gap: 1,
          flexGrow: 0,
          // detail turns the row into a block: label line, then its summary
          flexDirection: s.detail && detailsOn ? 'column' : 'row',
          alignItems: s.detail && detailsOn ? 'stretch' : 'center',
          color: active ? 'text.primary' : 'text.secondary',
          bgcolor: active ? alpha(accent, 0.08) : 'transparent',
          '&:hover': { bgcolor: alpha(accent, 0.05), color: 'text.primary' },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            width: '100%',
          }}
        >
          <Box sx={{ display: 'flex', color: active ? accent : 'inherit' }}>
            {s.icon}
          </Box>
          {/* The label yields before the row does: with a badge on the right
              (a long exec system id, say) an unshrinkable label pushed the row
              past the column and the nav grew a horizontal scrollbar. */}
          <Typography
            noWrap
            sx={{
              fontSize: 13,
              fontWeight: active ? 600 : 400,
              minWidth: 0,
              flexShrink: 1,
            }}
          >
            {s.label}
          </Typography>
          {s.badge && <SectionBadge badge={s.badge} pulse={badgePulse} />}
        </Box>
        {s.detail && detailsOn && (
          <Box sx={{ pl: 3, pb: 0.25, width: '100%' }}>
            {s.detail}
            {/* Inset rather than a border on the row: the rule floats clear of
                both edges, which is what makes the summary read as blocks
                rather than a table. */}
            <Divider sx={{ mt: 0.5, mr: 1 }} />
          </Box>
        )}
      </ListItemButton>
    );
  };

  return (
    <Box
      ref={rootRef}
      tabIndex={-1}
      onKeyDown={onPanelKeyDown}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        outline: 'none',
        // Pods-style rectangular chips, panel-global — never pills.
        '& .MuiChip-root': { borderRadius: '4px' },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        sx={{
          // the panel lives in a dialog: header padding is form you cannot see
          px: 2,
          py: 0.9,
          borderBottom: '1px solid',
          borderColor: 'divider',
          // the same tint the nav column wears, so the chrome reads as one
          // L around the content rather than as two unrelated strips
          bgcolor: PAGE_BG,
          flexShrink: 0,
        }}
      >
        <Typography sx={{ fontSize: 15, fontWeight: 600 }}>{title}</Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          noWrap
          sx={{ flex: 1 }}
        >
          {caption ?? ''}
        </Typography>
        {/* a walk keeps this under its pager, beside its other switches */}
        {!walk && detailsToggle}
        {headerExtras}
        {onClose && (
          <>
            {/* the panel's own close sits apart from the host's presses */}
            {headerExtras && (
              <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />
            )}
            <IconButton
              size="small"
              onClick={onClose}
              aria-label={`Close ${title}`}
              sx={{ ...HEAD_BTN_SX, width: 28, px: 0 }}
            >
              <CloseRounded sx={{ fontSize: 17 }} />
            </IconButton>
          </>
        )}
      </Stack>

      {banner}

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
        <Box
          component="nav"
          aria-label={`${title} sections`}
          sx={{
            width: effectiveNavWidth,
            flexShrink: 0,
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: PAGE_BG,
            // the LIST scrolls, not the column: whatever sits under it (the
            // arrows, a walk's pager, the footer) stays where it was however
            // long the list grows
            overflow: 'hidden',
            display: { xs: 'none', sm: 'flex' },
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              overflowX: 'hidden',
              py: 0.5,
            }}
          >
            {visibleGroups.map((group, index) => (
              <Box
                key={group.label || `group-${index}`}
                sx={{ mb: 0.5, pt: group.label ? 0 : 0.5 }}
              >
                {/* an empty label draws no heading: a first group needs none */}
                {group.label && (
                  <Typography
                    sx={{
                      fontSize: 10,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'text.disabled',
                      px: 1.25,
                      pt: 1,
                      pb: 0.5,
                    }}
                  >
                    {group.label}
                  </Typography>
                )}
                {group.items.map(navItem)}
              </Box>
            ))}
          </Box>
          {walk ? (
            !narrow && walkPager()
          ) : (
            <PagerArrows
              ref={arrowsRef}
              arrowAccent={arrowAccent}
              onStep={(d) => step(d)}
            />
          )}
          {footer}
        </Box>

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Mobile: nav pane hides, a jump strip takes over. */}
          <Box
            sx={{
              display: { xs: 'flex', sm: 'none' },
              gap: 0.75,
              px: 2,
              py: 1,
              overflowX: 'auto',
              borderBottom: '1px solid',
              borderColor: 'divider',
              flexShrink: 0,
            }}
          >
            {visibleSections.map((s) => (
              <Chip
                key={s.id}
                label={s.label}
                size="small"
                onClick={() => select(s.id)}
                sx={{
                  flexShrink: 0,
                  ...(selected?.id === s.id
                    ? { bgcolor: alpha(accent, 0.18), fontWeight: 600 }
                    : {}),
                }}
              />
            ))}
          </Box>

          {selected && (
            <>
              <SectionHeader
                icon={selected.icon}
                title={selected.title}
                subtitle={selected.subtitle}
                state={selected.state}
                accent={accent}
              />
              {keepAlive ? (
                // Every visited section stays mounted in its own scroller;
                // only the active one is displayed (and owns contentRef, so
                // wheel paging + arrival scrolling keep working unchanged).
                // A closed keepMounted host prunes visited to the active
                // section, so nothing extra lives behind a closed modal.
                (open
                  ? visitedRef.current.add(selected.id)
                  : ((visitedRef.current = new Set([selected.id])),
                    frozenRef.current.forEach((_, id) => {
                      if (id !== selected.id) frozenRef.current.delete(id);
                    })),
                visibleSections
                  .filter((s) => visitedRef.current.has(s.id))
                  .map((s) => {
                    const active = s.id === selected.id;
                    // only the active section renders; the rest re-use their
                    // last element (same reference => React bails out)
                    if (active) frozenRef.current.set(s.id, s.render());
                    const body = frozenRef.current.get(s.id);
                    return (
                      <Box
                        key={s.id}
                        ref={active ? contentRef : undefined}
                        onWheel={active ? onContentWheel : undefined}
                        sx={{
                          flex: 1,
                          minHeight: 0,
                          overflowY: 'auto',
                          px: 2,
                          py: 1.5,
                          display: active ? 'block' : 'none',
                        }}
                      >
                        <SectionActiveContext.Provider value={active && open}>
                          {body}
                        </SectionActiveContext.Provider>
                      </Box>
                    );
                  }))
              ) : (
                <Box
                  ref={contentRef}
                  onWheel={onContentWheel}
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    px: 2,
                    py: 1.5,
                  }}
                >
                  <SectionActiveContext.Provider value={open}>
                    {selected.render()}
                  </SectionActiveContext.Provider>
                </Box>
              )}
            </>
          )}
          {/* a phone has no nav column, so the walk sits under the form */}
          {narrow && walkPager()}
        </Box>

        {aside && (
          <Box
            sx={{
              width: 260,
              flexShrink: 0,
              borderLeft: '1px solid',
              borderColor: 'divider',
              bgcolor: PAGE_BG,
              overflowY: 'auto',
              display: { xs: 'none', md: 'block' },
            }}
          >
            {aside}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SectionedPanel;
