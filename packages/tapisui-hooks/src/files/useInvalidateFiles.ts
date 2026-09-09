import { useCallback } from 'react';
import { useQueryClient } from 'react-query';
import QueryKeys from './queryKeys';

/**
 * Returns a function that invalidates file listing queries so the listings
 * on screen refetch. Works regardless of the refetchOn* flags.
 *
 * The query key is [list, systemId, path, limit, token]: a call with no
 * argument invalidates every listing, and `systemId` limits it to one system.
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
