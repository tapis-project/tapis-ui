/**
 * What has to change in the cache when an app changes.
 *
 * Note the wrinkle this has to live with: useDetail caches under
 * QueryKeys.list too (with its own params), so one key prefix holds two
 * shapes — a list response whose `result` is an array of apps, and a
 * detail response whose `result` is one app. Anything patching that
 * cache has to handle both, which is why the patch is a pure function
 * with its own tests rather than an inline callback.
 */
import { QueryClient } from 'react-query';
import QueryKeys from './queryKeys';

/**
 * Flip `enabled` on one app wherever it sits in a cached response.
 *
 * Enable/disable answer with a change COUNT, not the app, so without
 * this the chip keeps saying the old thing until a refetch lands. The
 * value is returned unchanged when this app is not in it — react-query
 * hands every cached response under the key to this, including ones for
 * other apps entirely.
 */
export const patchCachedEnabled = (
  cached: unknown,
  appId: string,
  enabled: boolean
): unknown => {
  const old = cached as { result?: unknown } | undefined;
  if (!old || typeof old !== 'object' || !('result' in old)) return cached;

  // a list response
  if (Array.isArray(old.result)) {
    let touched = false;
    const result = (old.result as Array<{ id?: string }>).map((app) => {
      if (app?.id !== appId) return app;
      touched = true;
      return { ...app, enabled };
    });
    return touched ? { ...old, result } : cached;
  }

  // a detail response
  const one = old.result as { id?: string } | undefined;
  if (one && one.id === appId) {
    return { ...old, result: { ...one, enabled } };
  }
  return cached;
};

/**
 * Every read that shows an app's state. `list` covers the detail too
 * (see above); shareInfo is its own read and goes stale on any sharing
 * change.
 *
 * `deletedList` is here because delete and undelete both run through this,
 * and it is the ONLY read that can see a deleted app. Without it a delete
 * left the ordinary list refreshed and the deleted list stale, so the app
 * had left one and not yet arrived in the other — and its own page, which
 * reads the deleted listing to survive its own delete, answered
 * APPAPI_NOT_FOUND with no way back. Undelete had the mirror fault: the
 * app came back to the listings while the deleted list still held it.
 */
export const invalidateApp = (queryClient: QueryClient) => {
  queryClient.invalidateQueries(QueryKeys.list);
  queryClient.invalidateQueries(QueryKeys.listWindow);
  queryClient.invalidateQueries(QueryKeys.deletedList);
  queryClient.invalidateQueries(QueryKeys.shareInfo);
};
