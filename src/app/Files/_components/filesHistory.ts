/**
 * Where you have been in the file browser, in order.
 *
 * A file manager's back button is not the browser's. The browser's stack has
 * the systems list, the job you came from and the app page in it; Dolphin's
 * has directories. This keeps the second one: a cursor over the file
 * locations visited this session, so back walks the tree you were walking
 * rather than the pages you happened to open.
 *
 * Module-level with a listener set, the same shape as filesSearch and
 * infoDetail. Not persisted: a trail is a fact about right now, and one
 * restored from last week would send you somewhere you have forgotten
 * agreeing to.
 *
 * Keyed, because there is more than one file browser. The Files page keeps
 * one trail; a job's output browser keeps its own, so walking around inside a
 * job does not rewrite where you were on the Files page and vice versa. Both
 * behave identically — that is the point of them sharing this.
 */
/** Where, and when you were last there. */
export type TrailEntry = {
  location: string;
  /** epoch ms of the most recent visit, so the menu can say how long ago */
  at: number;
};

export type FilesHistoryState = {
  /** oldest first */
  entries: TrailEntry[];
  /** where the cursor is; -1 before anything has been visited */
  index: number;
};

/** A convenience, not an archive — the far end is not worth the memory. */
const LIMIT = 50;

/** The trail the Files page itself keeps. */
export const FILES_TRAIL = 'files';

const EMPTY: FilesHistoryState = { entries: [], index: -1 };
const trails = new Map<string, FilesHistoryState>();
const listeners = new Set<() => void>();
const announce = () => listeners.forEach((listener) => listener());

// One frozen object for every empty trail: useSyncExternalStore compares
// snapshots by identity, and a fresh {} each render is an infinite loop.
export const getFilesHistory = (trail: string): FilesHistoryState =>
  trails.get(trail) ?? EMPTY;

export const subscribeFilesHistory = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const canGoBack = (trail: string): boolean =>
  getFilesHistory(trail).index > 0;

/** The location at the cursor, or undefined before anything was visited. */
export const currentFilesLocation = (trail: string): string | undefined =>
  getFilesHistory(trail).entries[getFilesHistory(trail).index]?.location;

export const canGoForward = (trail: string): boolean => {
  const { entries, index } = getFilesHistory(trail);
  return index >= 0 && index < entries.length - 1;
};

/**
 * Record arriving somewhere.
 *
 * `pop` means the browser's own back/forward moved us. If that lands on a
 * place already in the trail we move the cursor to it instead of recording a
 * new visit — otherwise the browser's back button would erase the forward
 * half of ours, and the two buttons would disagree about the same journey.
 */
/**
 * Trails whose next recorded visit should REPLACE the cursor's entry rather
 * than append after it.
 *
 * Set by the one caller that needs it: back, when there is no history left
 * and it falls through to stepping up a directory. Appending there would put
 * the parent after the child, so a second back would walk you straight down
 * again — back and back oscillating between two directories. Replacing
 * instead means repeated back keeps climbing until it reaches the top, which
 * is the only thing 'back' can usefully mean once the trail is spent.
 */
const pendingReplace = new Set<string>();

export const replaceNextVisit = (trail: string) => {
  pendingReplace.add(trail);
};

const touch = (
  entries: TrailEntry[],
  index: number,
  now: number
): TrailEntry[] =>
  entries.map((entry, at) => (at === index ? { ...entry, at: now } : entry));

export const visitFilesLocation = (
  trail: string,
  location: string,
  pop = false,
  now: number = Date.now()
) => {
  const state = getFilesHistory(trail);
  const replacing = pendingReplace.delete(trail);
  if (state.entries[state.index]?.location === location) return;

  if (replacing && state.index >= 0) {
    const entries = [...state.entries];
    entries[state.index] = { location, at: now };
    trails.set(trail, { entries, index: state.index });
    announce();
    return;
  }

  if (pop) {
    const found = state.entries.findIndex(
      (entry) => entry.location === location
    );
    if (found >= 0) {
      // arriving somewhere again is a visit, so the trail records when
      trails.set(trail, {
        entries: touch(state.entries, found, now),
        index: found,
      });
      announce();
      return;
    }
  }

  // stepping somewhere new from the middle drops the future, as everywhere
  const kept = [
    ...state.entries.slice(0, state.index + 1),
    { location, at: now },
  ].slice(-LIMIT);
  trails.set(trail, { entries: kept, index: kept.length - 1 });
  announce();
};

/** The location to navigate to, or undefined if the cursor cannot move. */
export const stepFilesHistory = (
  trail: string,
  delta: number,
  now: number = Date.now()
): string | undefined => {
  const state = getFilesHistory(trail);
  const next = state.index + delta;
  if (next < 0 || next >= state.entries.length) return undefined;
  trails.set(trail, { entries: touch(state.entries, next, now), index: next });
  announce();
  return state.entries[next].location;
};

/** Jump straight to an entry, for the dropdown. */
export const goToFilesHistory = (
  trail: string,
  index: number,
  now: number = Date.now()
): string | undefined => {
  const state = getFilesHistory(trail);
  if (index < 0 || index >= state.entries.length) return undefined;
  trails.set(trail, { entries: touch(state.entries, index, now), index });
  announce();
  return state.entries[index].location;
};

/** Tests, and switching tenants. Without a trail, forgets all of them. */
export const resetFilesHistory = (trail?: string) => {
  if (trail) {
    trails.delete(trail);
    pendingReplace.delete(trail);
  } else {
    trails.clear();
    pendingReplace.clear();
  }
  announce();
};
