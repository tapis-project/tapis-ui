/**
 * Whether deleted systems ride the nav list — a per-device choice.
 *
 * The store itself is shared now (PageShell/deletedPref), because apps has
 * the same `showDeleted` + `/undelete` pair and wanted the same behaviour.
 * The names below are unchanged, and so are the localStorage keys, so every
 * existing importer and every existing saved choice carries straight over.
 */
import {
  makeDeletedPref,
  type DeletedVisibility,
} from 'app/_components/PageShell/deletedPref';

export type { DeletedVisibility };

/** the store itself, for the shared DeletedBanner */
export const deletedSystemsPref = makeDeletedPref('systems');
const pref = deletedSystemsPref;

export const subscribeDeletedPref = pref.subscribe;
export const getDeletedVisibility = pref.getVisibility;
export const setDeletedVisibility = pref.setVisibility;
export const useDeletedVisibility = pref.useVisibility;
export const getDeletedBannerDismissed = pref.getBannerDismissed;
export const dismissDeletedBanner = pref.dismissBanner;
export const useDeletedBannerDismissed = pref.useBannerDismissed;

/** Tests. */
export const resetDeletedPref = pref.reset;
