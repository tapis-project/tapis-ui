/**
 * Whether soft-deleted records ride a service's nav list — a per-device
 * choice, one store per service.
 *
 * Systems had this first, as its own module. Apps needs exactly the same
 * thing (its API has the same `showDeleted` + `/undelete` pair), and a
 * second copy of a working 80-line store is how the drift in
 * docs/CONSOLIDATION_BACKLOG.md starts. So the store is a factory and each
 * service is one line of it.
 *
 * Two values per service: the visibility itself (flipped from the nav's
 * little banner or from Settings — same store, both surfaces move
 * together), and whether the banner has been dismissed. The banner is a
 * teaching aid: it stands under the ledger while deleted records exist,
 * says how many are riding (or hidden), and carries the flip — X it away
 * and the choice still lives in Settings.
 *
 * The localStorage keys are `<service>.deletedVisibility` and
 * `<service>.deletedBannerDismissed`, which is what the systems module
 * already wrote — nobody's existing choice is lost by this move.
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
    // it still holds for this visit
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
