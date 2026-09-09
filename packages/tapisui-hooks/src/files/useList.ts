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
    // limit IS identity: a limit-1 access probe and a real limit-100
    // listing of the same path are different queries — sharing a key let
    // whichever won the race seed the other's cache (a one-file "listing")
    [QueryKeys.list, params.systemId, params.path, params.limit, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    ({ pageParam = params }) =>
      API.list(pageParam, basePath, accessToken?.access_token ?? ''),
    {
      // The house rule, finally kept here: no background refetching.
      // Without these the listing re-ran on every window focus — which
      // on a system you hold no credentials for re-logged the refusal
      // every time you alt-tabbed back, and made every mounted listing
      // in the app re-request at once. Freshness after a change now
      // comes from useInvalidateFiles, which says what it means; a
      // caller that genuinely wants polling can still pass its own.
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      ...options,
      // getNextPageParam function computes offset, with guarantee that
      // params.limit is set to default of 100
      getNextPageParam: (lastPage, allPages) =>
        tapisNextPageParam<Files.FileListingResponse>(
          lastPage,
          allPages,
          params
        ),
      // A caller's `enabled` is a veto, not a suggestion. This used to
      // be a bare `!!accessToken` sitting after the spread, silently
      // overwriting it — so the systems page's `enabled: !isDeleted`
      // (don't knock on a deleted system) did nothing, and the page
      // manufactured the very refusal it then had to suppress.
      // dev fixed this independently as `options.enabled !== false`;
      // same semantics, and this is the spelling the house rule uses.
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
