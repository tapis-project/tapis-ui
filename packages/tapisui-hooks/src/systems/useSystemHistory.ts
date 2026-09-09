import { useQuery, QueryObserverOptions } from 'react-query';
import { Systems as API } from '@tapis/tapisui-api';
import { Systems } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';

// GET /v3/systems/{systemId}/history — who did what to this system, when.
// Named useSystemHistory (not useHistory) so it can share a file with
// react-router's hook without a collision.
const useSystemHistory = (
  params: Systems.GetHistoryRequest,
  options: QueryObserverOptions<Systems.RespSystemHistory, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  return useQuery<Systems.RespSystemHistory, Error>(
    [QueryKeys.history, params, accessToken],
    () => API.getHistory(params, basePath, accessToken?.access_token || ''),
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      ...options,
      enabled: !!accessToken && (options.enabled ?? true),
    }
  );
};

export default useSystemHistory;
