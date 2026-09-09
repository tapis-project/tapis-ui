/**
 * Back/forward trail of file locations visited this session, per file browser.
 * Separate from the browser history, which also holds other pages. Module
 * level with a listener set (same shape as filesSearch and infoDetail). Not
 * persisted. The Files page and each job output browser keep separate trails.
 */
/** Where, and when you were last there. */
export type TrailEntry = {
  location: string;
  /** epoch ms of the most recent visit (shown in the menu) */
  at: number;
};

export type FilesHistoryState = {
  /** oldest first */
  entries: TrailEntry[];
  /** where the cursor is; -1 before anything has been visited */
  index: number;
};

/** maximum entries kept per trail */
const LIMIT = 50;

/** The trail the Files page itself keeps. */
export const FILES_TRAIL = 'files';

const EMPTY: FilesHistoryState = { entries: [], index: -1 };
const trails = new Map<string, FilesHistoryState>();
const listeners = new Set<() => void>();
const announce = () => listeners.forEach((listener) => listener());

// Shared empty state: useSyncExternalStore compares snapshots by identity, so a new object per call would loop.
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
 * Trails whose next recorded visit replaces the cursor's entry instead of
 * appending. Set by back when it has no history and steps up a directory;
 * appending would put the parent after the child and the next back would
 * return to the child.
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

/**
 * Record arriving at a location. `pop` means the browser's back/forward
 * moved us: if the location is already in the trail, move the cursor to it
 * instead of recording a new visit, so the two histories stay consistent.
 */
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
      // a revisit updates the entry's timestamp
      trails.set(trail, {
        entries: touch(state.entries, found, now),
        index: found,
      });
      announce();
      return;
    }
  }

  // a new location from the middle of the trail drops the forward entries
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

/** For tests and tenant switches. With no argument, clears all trails. */
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
