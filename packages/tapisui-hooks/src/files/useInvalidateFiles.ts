import { useCallback } from 'react';
import { useQueryClient } from 'react-query';
import QueryKeys from './queryKeys';

/**
 * Refresh the file listing after something changed it.
 *
 * Every file mutation in this app used to do that by calling
 * `focusManager.setFocused(true)` — pretending the window had just been
 * focused so react-query's refetch-on-focus would fire. That worked, but
 * it made a global signal out of a local event: EVERY query with focus
 * refetching enabled re-ran, on every mkdir, and the listing could only
 * stay fresh for as long as focus refetching stayed on. It also meant
 * the listing re-fetched on every real alt-tab, which on a system you
 * hold no credentials for re-logged the refusal each time.
 *
 * So: say what is meant. Invalidating the listing key refetches the
 * listings that are actually on screen and nothing else — and it works
 * regardless of the refetchOn* flags, which are now all off per the
 * house rule.
 *
 * `systemId` narrows it to one system when the caller knows which; the
 * key is [list, systemId, path, limit, token], so a bare call refreshes
 * every listing and a systemId refreshes every path on that system.
 */
const useInvalidateFiles = () => {
  const queryClient = useQueryClient();
  return useCallback(
    (systemId?: string) =>
      queryClient.invalidateQueries(
        systemId ? [QueryKeys.list, systemId] : QueryKeys.list
      ),
    [queryClient]
  );
};

export default useInvalidateFiles;
