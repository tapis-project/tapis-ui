import { useQuery, QueryObserverOptions } from 'react-query';
import { Workflows as API } from '@tapis/tapisui-api';
import { Workflows } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';

const useDetails = (
  params: Workflows.GetPipelineRequest,
  options: QueryObserverOptions<Workflows.RespPipeline, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Workflows.RespPipeline, Error>(
    [QueryKeys.details, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () =>
      API.Pipelines.details(params, basePath, accessToken?.access_token || ''),
    {
      ...options,
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useDetails;
