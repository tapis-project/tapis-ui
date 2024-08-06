import { useInfiniteQuery } from 'react-query';
import { Files as API } from '@tapis/tapisui-api';
import { Files } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../../';
import { concatResults, tapisNextPageParam } from '../../utils/infiniteQuery';
import QueryKeys from './queryKeys';

// Does not use defaultParams because systemId and path are required
const useList = (params: Files.GetRecentTransferTasksRequest) => {
  const { accessToken, basePath } = useTapisConfig();

  // Set default limit to 100, as per TAPIS OpenAPI spec
  params.limit = params.limit ?? 100;

  const result = useInfiniteQuery<Files.TransferTaskListResponse, Error>(
    [QueryKeys.list, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    ({ pageParam = params }) =>
      API.Transfers.list(pageParam, basePath, accessToken?.access_token ?? ''),
    {
      // getNextPageParam function computes offset, with guarantee that
      // params.limit is set to default of 100
      getNextPageParam: (lastPage, allPages) =>
        tapisNextPageParam<Files.TransferTaskListResponse>(
          lastPage,
          allPages,
          params
        ),
      enabled: !!accessToken,
    }
  );

  // If there are result pages, concatenate the results
  const concatenatedResults = result.data?.pages
    ? concatResults<Files.TransferTask>(result.data.pages)
    : null;

  return {
    ...result,
    concatenatedResults,
  };
};

export default useList;
