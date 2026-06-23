/**
 * Module-level store for Pods admin mode (X-Pods-Admin header).
 * Works outside React (for the API header provider) and inside React
 * (via useSyncExternalStore hook).
 */
let _adminMode = false;
const _listeners = new Set<() => void>();

export const getPodsAdminMode = (): boolean => _adminMode;

export const setPodsAdminMode = (active: boolean) => {
  _adminMode = active;
  _listeners.forEach((fn) => fn());
};

export const subscribePodsAdminMode = (listener: () => void) => {
  _listeners.add(listener);
  return () => {
    _listeners.delete(listener);
  };
};
