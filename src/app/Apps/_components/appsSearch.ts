/**
 * appsSearch — module-level store bridging the nav's search box to the
 * landing table, so /apps has ONE search instead of two. Same pattern as
 * filesSearch and jobsSearch: works outside React for the nav callback,
 * inside via useSyncExternalStore.
 */
let _query = '';
const _listeners = new Set<() => void>();

export const getAppsSearch = (): string => _query;

export const setAppsSearch = (q: string) => {
  if (q === _query) return;
  _query = q;
  _listeners.forEach((fn) => fn());
};

export const subscribeAppsSearch = (listener: () => void) => {
  _listeners.add(listener);
  return () => {
    _listeners.delete(listener);
  };
};
