import { useQuery, QueryObserverOptions } from 'react-query';
import { Workflows as API } from '@tapis/tapisui-api';
import { Workflows } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';

export type ListAllPipelinesParams = {
  groupIds: Array<string>;
};

const useListAll = (
  params: ListAllPipelinesParams,
  options: QueryObserverOptions<Workflows.RespPipelineList, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Workflows.RespPipelineList, Error>(
    [QueryKeys.listAll, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () =>
      API.Pipelines.listAll(params, basePath, accessToken?.access_token || ''),
    {
      ...options,
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useListAll;
