import { useQuery, QueryObserverOptions } from 'react-query';
import { list } from 'tapis-api/workflows/taskexecutions';
import { Workflows } from '@tapis/tapis-typescript';
import { useTapisConfig } from 'tapis-hooks';
import QueryKeys from './queryKeys';

const useList = (
  params: Workflows.ListTaskExecutionsRequest,
  options: QueryObserverOptions<Workflows.RespTaskExecutionList, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Workflows.RespTaskExecutionList, Error>(
    [QueryKeys.list, accessToken],
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
