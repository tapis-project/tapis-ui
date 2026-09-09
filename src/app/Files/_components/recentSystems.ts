/**
 * recentSystems — which storage systems this browser actually opens.
 *
 * There is no server-side "last browsed" for systems, and jobs history only
 * covers execution — so the Files nav's recency signal is local: every visit
 * to /files/{systemId} stamps the id here (localStorage, capped, newest
 * first). Honest about its scope: it is "recently browsed on this device",
 * not global usage, and the nav labels it that way.
 */

const KEY = 'files-recent-systems';
const CAP = 30;

export interface RecentEntry {
  id: string;
  ts: number;
}

const read = (): RecentEntry[] => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is RecentEntry =>
        !!e && typeof e.id === 'string' && typeof e.ts === 'number'
    );
  } catch {
    return [];
  }
};

export const recordRecentSystem = (id: string | undefined): void => {
  if (!id) return;
  try {
    const rest = read().filter((e) => e.id !== id);
    localStorage.setItem(
      KEY,
      JSON.stringify([{ id, ts: Date.now() }, ...rest].slice(0, CAP))
    );
  } catch {
    /* private mode — recency just won't persist */
  }
};

/** id → last-visited ms, for the nav join. */
export const recentSystemsMap = (): Map<string, number> =>
  new Map(read().map((e) => [e.id, e.ts]));
