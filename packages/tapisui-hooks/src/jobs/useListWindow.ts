import { useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query';
import { Jobs as API } from '@tapis/tapisui-api';
import { Jobs } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';

export type ListWindowPage<T> = { items: T[]; total?: number };

/**
 * The jobs list as an expandable window — pages of `windowSize` newest-first,
 * with the server's `computeTotal` asked once on the first page. The response
 * metadata is untyped in the generated client, so the total is read
 * defensively. Pages normalize to `{ items, total }`.
 */
const useListWindow = (
  params: Omit<Jobs.GetJobListRequest, 'limit' | 'skip' | 'computeTotal'> = {
    orderBy: 'created(desc)',
  },
  windowSize = 50,
  options: UseInfiniteQueryOptions<ListWindowPage<Jobs.JobListDTO>, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  return useInfiniteQuery<ListWindowPage<Jobs.JobListDTO>, Error>(
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
