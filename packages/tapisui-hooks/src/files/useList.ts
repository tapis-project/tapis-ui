import { useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query';
import { Files as API } from '@tapis/tapisui-api';
import { Files } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../';
import { concatResults, tapisNextPageParam } from '../utils/infiniteQuery';
import QueryKeys from './queryKeys';

// Does not use defaultParams because systemId and path are required
const useList = (
  params: Files.ListFilesRequest,
  options: UseInfiniteQueryOptions<Files.FileListingResponse, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();

  // Set default limit to 100, as per TAPIS OpenAPI spec
  params.limit = params.limit ?? 100;

  const result = useInfiniteQuery<Files.FileListingResponse, Error>(
    // limit is part of the key: a limit-1 access probe and a limit-100
    // listing of the same path must not share a cache entry
    [QueryKeys.list, params.systemId, params.path, params.limit, accessToken],
    // No token gives an empty string, which produces the expected 403
    ({ pageParam = params }) =>
      API.list(pageParam, basePath, accessToken?.access_token ?? ''),
    {
      // No background refetching. Freshness after a change comes from
      // useInvalidateFiles; callers can pass their own polling options.
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      ...options,
      // computes the next offset; params.limit is always set above
      getNextPageParam: (lastPage, allPages) =>
        tapisNextPageParam<Files.FileListingResponse>(
          lastPage,
          allPages,
          params
        ),
      // A caller's `enabled: false` must win over the token check, so this
      // follows the spread.
      enabled: (options.enabled ?? true) && !!accessToken,
    }
  );

  // If there are result pages, concatenate the results
  const concatenatedResults = result.data?.pages
    ? concatResults<Files.FileInfo>(result.data.pages)
    : null;

  return {
    ...result,
    concatenatedResults,
  };
};

export default useList;
