/**
 * Which data engine the navs run on — the spine's windowed fetching, or the
 * classic fetch-everything path. A preference, not a migration: both stay
 * wired (same pattern as the file listing's rebuilt/classic switch) so the
 * new engine can be judged against the old one in place.
 */

export type NavEngine = 'rebuilt' | 'classic';

const STORAGE_KEY = 'nav.dataEngine';

const read = (): NavEngine => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'classic'
      ? 'classic'
      : 'rebuilt';
  } catch {
    return 'rebuilt';
  }
};

let engine: NavEngine = read();
const listeners = new Set<() => void>();

export const getNavEngine = (): NavEngine => engine;

export const setNavEngine = (next: NavEngine) => {
  engine = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* private mode: the choice lives for the session */
  }
  listeners.forEach((l) => l());
};

export const subscribeNavEngine = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** tests only — back to the default with storage cleared */
export const resetNavEngine = () => {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  engine = 'rebuilt';
  listeners.forEach((l) => l());
};
