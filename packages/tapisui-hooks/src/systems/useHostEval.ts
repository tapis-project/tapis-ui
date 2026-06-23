import { useQuery, QueryObserverOptions } from 'react-query';
import { Systems as API } from '@tapis/tapisui-api';
import { Systems } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';

const useHostEval = (
  params: Systems.HostEvalRequest,
  options: QueryObserverOptions<Systems.RespName, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Systems.RespName, Error>(
    [QueryKeys.hostEval, params, accessToken],
    () => API.hostEval(params, basePath, accessToken?.access_token ?? ''),
    {
      ...options,
      enabled:
        (options.enabled ?? true) &&
        !!accessToken &&
        !!params.systemId &&
        !!params.envVarName,
    }
  );
  return result;
};

export default useHostEval;
