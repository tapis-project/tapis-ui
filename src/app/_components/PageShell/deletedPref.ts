/**
 * Per-device, per-service store: whether soft-deleted records appear in the
 * nav list, and whether the nav banner about them was dismissed. The nav
 * banner and Settings share the same store.
 * localStorage keys: `<service>.deletedVisibility`, `<service>.deletedBannerDismissed`.
 */
import { useSyncExternalStore } from 'react';

export type DeletedVisibility = 'show' | 'hide';

export type DeletedPref = {
  getVisibility: () => DeletedVisibility;
  setVisibility: (next: DeletedVisibility) => void;
  useVisibility: () => DeletedVisibility;
  getBannerDismissed: () => boolean;
  dismissBanner: () => void;
  useBannerDismissed: () => boolean;
  subscribe: (listener: () => void) => () => void;
  /** tests */
  reset: () => void;
};

const read = <T>(key: string, parse: (raw: string | null) => T): T => {
  try {
    return parse(window.localStorage.getItem(key));
  } catch {
    return parse(null);
  }
};

const write = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // storage unavailable: the value is kept in memory for this visit
  }
};

export const makeDeletedPref = (service: string): DeletedPref => {
  const VIS_KEY = `${service}.deletedVisibility`;
  const BANNER_KEY = `${service}.deletedBannerDismissed`;

  let visibility: DeletedVisibility = read(VIS_KEY, (raw) =>
    raw === 'hide' ? 'hide' : 'show'
  );
  let bannerDismissed: boolean = read(BANNER_KEY, (raw) => raw === 'true');

  const listeners = new Set<() => void>();
  const announce = () => listeners.forEach((listener) => listener());

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const getVisibility = () => visibility;
  const getBannerDismissed = () => bannerDismissed;

  return {
    subscribe,
    getVisibility,
    setVisibility: (next: DeletedVisibility) => {
      visibility = next;
      write(VIS_KEY, next);
      announce();
    },
    useVisibility: () => useSyncExternalStore(subscribe, getVisibility),
    getBannerDismissed,
    dismissBanner: () => {
      bannerDismissed = true;
      write(BANNER_KEY, 'true');
      announce();
    },
    useBannerDismissed: () =>
      useSyncExternalStore(subscribe, getBannerDismissed),
    reset: () => {
      visibility = 'show';
      bannerDismissed = false;
      try {
        window.localStorage.removeItem(VIS_KEY);
        window.localStorage.removeItem(BANNER_KEY);
      } catch {
        /* nothing to clear */
      }
      announce();
    },
  };
};
