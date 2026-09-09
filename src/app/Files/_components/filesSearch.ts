/**
 * filesSearch — module-level store bridging the nav's search box to the
 * landing table, so /files has ONE search instead of two. Same pattern as
 * utils/podsAdminMode: works outside React for the callback, inside via
 * useSyncExternalStore.
 */
let _query = '';
const _listeners = new Set<() => void>();

export const getFilesSearch = (): string => _query;

export const setFilesSearch = (q: string) => {
  if (q === _query) return;
  _query = q;
  _listeners.forEach((fn) => fn());
};

export const subscribeFilesSearch = (listener: () => void) => {
  _listeners.add(listener);
  return () => {
    _listeners.delete(listener);
  };
};
