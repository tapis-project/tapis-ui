/**
 * Whether deleted apps ride the nav list — a per-device choice, the same
 * one systems has, on the same shared store.
 *
 * Apps earns it: the Apps API carries `showDeleted` on its listing and a
 * real `/v3/apps/{appId}/undelete`, so a deleted app is genuinely
 * recoverable — it just had no way to be found. `useDeletedApps` had been
 * sitting in the hooks package with no consumer at all.
 */
import {
  makeDeletedPref,
  type DeletedVisibility,
} from 'app/_components/PageShell/deletedPref';

export type { DeletedVisibility };

/** the store itself, for the shared DeletedBanner */
export const deletedAppsPref = makeDeletedPref('apps');
const pref = deletedAppsPref;

export const subscribeDeletedAppsPref = pref.subscribe;
export const getDeletedAppsVisibility = pref.getVisibility;
export const setDeletedAppsVisibility = pref.setVisibility;
export const useDeletedAppsVisibility = pref.useVisibility;
export const getDeletedAppsBannerDismissed = pref.getBannerDismissed;
export const dismissDeletedAppsBanner = pref.dismissBanner;
export const useDeletedAppsBannerDismissed = pref.useBannerDismissed;

/** Tests. */
export const resetDeletedAppsPref = pref.reset;
