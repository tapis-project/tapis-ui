import { useQuery, QueryObserverOptions } from 'react-query';
import { listAll } from 'tapis-api/workflows/archives';
import { Workflows } from '@tapis/tapis-typescript';
import { useTapisConfig } from 'tapis-hooks';
import QueryKeys from './queryKeys';

export type ListAllArchivesParams = {
  groupIds: Array<string>;
};

const useListAll = (
  params: ListAllArchivesParams,
  options: QueryObserverOptions<Workflows.RespArchiveList, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Workflows.RespArchiveList, Error>(
    [QueryKeys.listAll, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () => listAll(params, basePath, accessToken?.access_token || ''),
    {
      ...options,
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useListAll;
