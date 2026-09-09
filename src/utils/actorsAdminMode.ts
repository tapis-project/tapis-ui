/**
 * Module-level store for Actors admin mode (X-Tapis-Admin header).
 * Works outside React (for the API header provider) and inside React
 * (via useSyncExternalStore hook).
 */
let _adminMode = false;
const _listeners = new Set<() => void>();

export const getActorsAdminMode = (): boolean => _adminMode;

export const setActorsAdminMode = (active: boolean) => {
  _adminMode = active;
  _listeners.forEach((fn) => fn());
};

export const subscribeActorsAdminMode = (listener: () => void) => {
  _listeners.add(listener);
  return () => {
    _listeners.delete(listener);
  };
};
