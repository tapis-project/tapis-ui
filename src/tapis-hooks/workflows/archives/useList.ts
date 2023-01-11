import { useQuery, QueryObserverOptions } from 'react-query';
import { list } from 'tapis-api/workflows/archives';
import { Workflows } from '@tapis/tapis-typescript';
import { useTapisConfig } from 'tapis-hooks';
import QueryKeys from './queryKeys';

const useList = (
  params: Workflows.ListArchivesRequest,
  options: QueryObserverOptions<Workflows.RespArchiveList, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Workflows.RespArchiveList, Error>(
    [QueryKeys.list, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () => list(params, basePath, accessToken?.access_token || ''),
    {
      ...options,
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useList;
