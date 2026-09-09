import { useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query';
import { Systems as API } from '@tapis/tapisui-api';
import { Systems } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';

export type ListWindowPage<T> = { items: T[]; total?: number };

/**
 * The systems list as an expandable window instead of one unbounded fetch.
 *
 * Each page asks for `windowSize` rows; the first page also asks the server
 * to `computeTotal` (a count query — once per window, not per page) so the
 * caller can say "50 of 312" honestly. `fetchNextPage` appends the next
 * `windowSize` using `skip`, and the window is complete when a page comes
 * back short or the total is reached.
 *
 * Pages are normalized to `{ items, total }` here so consumers never touch
 * the Resp envelope shape.
 */
const useListWindow = (
  params: Omit<Systems.GetSystemsRequest, 'limit' | 'skip' | 'computeTotal'> = {
    listType: Systems.ListTypeEnum.All,
  },
  windowSize = 50,
  options: UseInfiniteQueryOptions<
    ListWindowPage<Systems.TapisSystem>,
    Error
  > = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  return useInfiniteQuery<ListWindowPage<Systems.TapisSystem>, Error>(
    [QueryKeys.listWindow, params, windowSize, accessToken],
    async ({ pageParam = 0 }) => {
      const resp = await API.list(
        {
          ...params,
          limit: windowSize,
          skip: pageParam as number,
          computeTotal: pageParam === 0,
        },
        basePath,
        accessToken?.access_token || ''
      );
      return {
        items: resp.result ?? [],
        total: (resp.metadata as { totalCount?: number } | undefined)
          ?.totalCount,
      };
    },
    {
      enabled: !!accessToken,
      getNextPageParam: (last, pages) =>
        last.items.length < windowSize
          ? undefined
          : pages.reduce((n, p) => n + p.items.length, 0),
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      ...options,
    }
  );
};

export default useListWindow;
