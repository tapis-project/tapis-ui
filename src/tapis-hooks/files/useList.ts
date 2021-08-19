import { useInfiniteQuery } from 'react-query';
import { list } from 'tapis-api/files';
import { Files } from '@tapis/tapis-typescript';
import { useTapisConfig } from 'tapis-hooks';
import { concatResults } from 'tapis-hooks/utils/concatResults';
import QueryKeys from './queryKeys';

type useListParams = {
  systemId: string;
  path: string;
  limit?: number;
};

const useList = ({ systemId, path, limit = 100 }: useListParams) => {
  const { accessToken, basePath } = useTapisConfig();
  const params: Files.ListFilesRequest = {
    systemId,
    path,
    limit
  };
  const result = useInfiniteQuery<Files.FileListingResponse, Error>(
    [QueryKeys.list, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    ({ pageParam = params }) =>
      list(pageParam, basePath, accessToken?.access_token ?? ''),
    {
      getNextPageParam: (lastPage, allPages) => {
        if ((lastPage.result?.length ?? 0) < limit) return undefined;
        return { ...params, offset: allPages.length * limit };
      },
      enabled: !!accessToken
    }
  );

  // If there are result pages, concatenate the results
  const concatenatedResults = result.data?.pages
    ? concatResults<Files.FileInfo>(result.data.pages)
    : null;

  return {
    ...result,
    concatenatedResults
  };
};

export default useList;
