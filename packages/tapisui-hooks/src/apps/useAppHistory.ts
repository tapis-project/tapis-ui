import { useQuery, QueryObserverOptions } from 'react-query';
import { Apps } from '@tapis/tapis-typescript';
import { Apps as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';

// The service's own change ledger for one app. Named useAppHistory (not
// useHistory) so it can sit beside react-router's in a component.
const useAppHistory = (
  params: Apps.GetHistoryRequest,
  options: QueryObserverOptions<Apps.RespAppHistory, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  return useQuery<Apps.RespAppHistory, Error>(
    [QueryKeys.history, params, accessToken],
    () => API.getHistory(params, basePath, accessToken?.access_token ?? ''),
    {
      enabled: !!accessToken && !!params.appId,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      ...options,
    }
  );
};

export default useAppHistory;
