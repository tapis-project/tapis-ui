import { useQuery, QueryObserverOptions } from 'react-query';
import { Workflows as API } from '@tapis/tapisui-api';
// import { Workflows as WorkflowsAPI } from '@tapis/tapisui-api';
import { Workflows } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';

// const listAll = WorkflowsAPI.Archives.listAll

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
    () =>
      API.Archives.listAll(params, basePath, accessToken?.access_token || ''),
    {
      ...options,
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useListAll;
