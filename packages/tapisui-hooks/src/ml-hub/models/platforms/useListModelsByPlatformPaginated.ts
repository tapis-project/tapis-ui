import { useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api';
import { Models } from '@mlhub/ts-sdk';
import { useTapisConfig } from '../../../';
import { concatResults } from '../../../utils/infiniteQuery';
import QueryKeys from './queryKeys';

export interface ListModelsByPlatformPaginatedParams {
  platform: string;
  limit?: number;
}

const useListModelsByPlatformPaginated = (
  params: ListModelsByPlatformPaginatedParams,
  options: UseInfiniteQueryOptions<
    Models.ListModelsByPlatformResponse,
    Error
  > = {}
) => {
  const { accessToken, basePath, mlHubBasePath } = useTapisConfig();

  // Set default limit to 100
  const limit = params.limit ?? 100;

  const result = useInfiniteQuery<Models.ListModelsByPlatformResponse, Error>(
    [
      QueryKeys.listModelsByPlatform,
      params.platform,
      limit,
      'paginated',
      accessToken,
    ],
    async ({ pageParam = 0 }) => {
      if (!accessToken?.access_token) {
        throw new Error('No access token available');
      }

      const response = await (API.Models.Platforms.listModelsByPlatform as any)(
        params.platform,
        mlHubBasePath + '/mlhub',
        accessToken.access_token,
        limit,
        pageParam // offset
      );

      return response;
    },
    {
      ...options,
      enabled: !!accessToken?.access_token && !!params.platform,
      getNextPageParam: (lastPage, allPages) => {
        // If we got fewer results than the limit, we've reached the end
        if ((lastPage.result?.length ?? 0) < limit) {
          return undefined;
        }
        // Return the next offset
        return allPages.length * limit;
      },
    }
  );

  // Concatenate all pages of results
  const concatenatedResults = result.data?.pages
    ? concatResults<{ [key: string]: any }>(result.data.pages)
    : [];

  return {
    ...result,
    concatenatedResults,
  };
};

export default useListModelsByPlatformPaginated;
