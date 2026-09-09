import { useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query';
import { Apps as API } from '@tapis/tapisui-api';
import { Apps } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';

export type ListWindowPage<T> = { items: T[]; total?: number };

/**
 * The apps list as an expandable window — same contract as the systems and
 * jobs windows: pages of `windowSize`, `computeTotal` once on the first
 * page, normalized to `{ items, total }`.
 */
const useListWindow = (
  params: Omit<Apps.GetAppsRequest, 'limit' | 'skip' | 'computeTotal'> = {
    listType: Apps.ListTypeEnum.All,
    select: 'allAttributes',
    orderBy: 'id(asc)',
  },
  windowSize = 50,
  options: UseInfiniteQueryOptions<ListWindowPage<Apps.TapisApp>, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  return useInfiniteQuery<ListWindowPage<Apps.TapisApp>, Error>(
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
