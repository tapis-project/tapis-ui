import { useQuery, QueryObserverOptions } from 'react-query';
import { Apps } from '@tapis/tapis-typescript';
import { Apps as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';
import { noBackgroundRefetch } from '../utils/cachePolicy';

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
      ...noBackgroundRefetch,
      refetchOnMount: false,
      ...options,
      enabled: (options.enabled ?? true) && !!accessToken && !!params.appId,
    }
  );
};

export default useAppHistory;
