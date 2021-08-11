import { useInfiniteQuery } from 'react-query';
import { list } from 'tapis-api/systems';
import { Systems } from '@tapis/tapis-typescript'
import { useTapisConfig } from 'tapis-hooks';

const useList = (params: Systems.GetSystemsRequest) => {
  const { accessToken, basePath } = useTapisConfig();
  const limit = params.limit ?? 100;
  const result = useInfiniteQuery<Systems.RespSystems, Error>(
    [params],
    ({ pageParam = params }) => list(pageParam, basePath, accessToken.access_token),
    {
      getNextPageParam: (lastPage, allPages) => {
        if ((lastPage.result?.length ?? 0) < limit) return undefined;
        return { ...params, offset: allPages.length * limit };
      }
    }
  );
  return result;
}

export default useList;