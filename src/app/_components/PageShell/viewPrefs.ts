/**
 * Cross-page view preferences — small per-device choices about how the
 * landing tables and the file explorer occupy the window. Each is a
 * localStorage-backed store with the same shape as the density store the
 * table rail carries; Settings › Preferences writes them, the pages read
 * them live.
 */
import { useSyncExternalStore } from 'react';

export const makeChoiceStore = <T extends string>(
  key: string,
  values: readonly T[],
  fallback: T
) => {
  const read = (): T => {
    try {
      const raw = window.localStorage.getItem(key);
      return values.includes(raw as T) ? (raw as T) : fallback;
    } catch {
      return fallback;
    }
  };
  let current: T = read();
  const listeners = new Set<() => void>();
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };
  const get = (): T => current;
  const set = (next: T) => {
    current = next;
    try {
      window.localStorage.setItem(key, next);
    } catch {
      // it still holds for this visit
    }
    listeners.forEach((listener) => listener());
  };
  const reset = () => {
    current = fallback;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // fine
    }
    listeners.forEach((listener) => listener());
  };
  const use = (): T => useSyncExternalStore(subscribe, get);
  return { get, set, reset, subscribe, use, fallback };
};

export type TableChromePlacement = 'bottom' | 'top';
export type FitMode = 'flow' | 'pinned' | 'capped';

/**
 * Where a landing table wears its strip — the window facts, the transient
 * hint, the columns / ⓘ / density presses. 'bottom' folds it into the
 * table's footer (nothing between the stat tiles and the header row);
 * 'top' wears it as a header row atop the table, inside the same frame.
 */
export const tableChromePlacement = makeChoiceStore<TableChromePlacement>(
  'tables.chrome',
  ['bottom', 'top'],
  'bottom'
);

/**
 * How a landing table meets the window.
 *
 *   flow    grows with its rows and lets the page scroll
 *   pinned  caps at the window's bottom edge, measured, and scrolls its
 *           own rows under a sticky header
 *   capped  the same self-scrolling frame, but at a FIXED height of
 *           CAPPED_ROWS rows whatever the window is doing
 *
 * 'capped' exists because 'pinned' is only as tall as the window allows:
 * on a tall screen it is a wall of rows, on a short one a porthole, and
 * the page's height changes under you as the cards above it load. A fixed
 * number of rows is the same table every time, on every machine.
 */
export const tableFit = makeChoiceStore<FitMode>(
  'tables.fit',
  ['flow', 'pinned', 'capped'],
  'flow'
);

/** how many rows 'capped' shows before it scrolls its own body */
export const CAPPED_ROWS = 15;

/**
 * How much frame a landing table wears.
 *
 * 'framed' is the original: a washed header band and a rule under every
 * row. 'plain' is the look the in-card tables have always had — no wash,
 * no per-row rules, the header carried by its own weight — which reads
 * quieter and lets the rows themselves be the structure.
 */
export type TableStyle = 'plain' | 'framed';

export const tableStyle = makeChoiceStore<TableStyle>(
  'tables.style',
  ['plain', 'framed'],
  'plain'
);

/**
 * Whether a landing table names itself inside its own frame, the way the
 * in-card tables do ("Recent runs"), or lets the page header do the
 * naming.
 */
export const tableTitles = makeChoiceStore(
  'tables.titles',
  ['shown', 'hidden'],
  'shown'
);

/**
 * The same choice for the file explorer — the Files page listing and the
 * output browser at the foot of a job. 'pinned' is the Files page's
 * long-standing behavior (the listing owns the scrolling); 'flow' lets
 * the listing grow and the page scroll past it.
 */
export const explorerFit = makeChoiceStore<FitMode>(
  'files.explorerFit',
  ['pinned', 'flow'],
  'pinned'
);

/**
 * The daylight between a pinned surface's bottom edge and the pane's
 * bottom bar, in px (the choices are rem steps: 0.2 / 0.4 / 1).
 */
export const pinGap = makeChoiceStore<string>(
  'pin.gap',
  ['3.2', '6.4', '16'],
  '6.4'
);

export const usePinGapPx = (): number => parseFloat(pinGap.use());

/**
 * How many listing rows a pinned inline explorer holds onto when the
 * cards above crowd it — under that, the page scrolls the difference
 * instead. A directory with fewer files than this simply renders
 * smaller; the minimum reserves space, it never stretches.
 */
export const explorerMinRows = makeChoiceStore<string>(
  'explorer.minRows',
  ['6', '10', '14', '20'],
  '14'
);

/**
 * Where a detail card keeps its acts — the submit / JSON / cog cluster.
 *
 * On the head line they sit beside the title, which is where the eye
 * looks first and also where a long id, six chips and three presses run
 * out of room. Under the id line or as a bar at the card's foot, they get
 * a row of their own and the head line goes back to saying what the thing
 * IS.
 */
export type ActionBarPlacement = 'head' | 'under-id' | 'foot';

export const actionBar = makeChoiceStore<string>(
  'detail.actions',
  ['head', 'under-id', 'foot'],
  'head'
);

/**
 * How a job's status reads. 'classic' is the single Tapis-status glyph
 * this app has always drawn; 'rebuilt' splits the question in two — a
 * glyph for whether work happened, a corner badge for what ended it — so
 * an interactive session you ran for an hour and then stopped no longer
 * reads the same as one that died on the launch pad. See jobVerdict.
 */
export type GlyphStyle = 'classic' | 'rebuilt';

export const jobGlyphStyle = makeChoiceStore<string>(
  'jobs.glyph',
  ['classic', 'rebuilt'],
  'rebuilt'
);
