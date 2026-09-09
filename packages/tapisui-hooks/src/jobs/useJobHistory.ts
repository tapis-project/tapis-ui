import { useQuery, UseQueryOptions } from 'react-query';
import { Jobs } from '@tapis/tapis-typescript';
import { Jobs as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';

/** the run's event ledger — load-on-press, like every other history box */
const useJobHistory = (
  params: Jobs.GetJobHistoryRequest,
  options?: UseQueryOptions<Jobs.RespJobHistory, Error>
) => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  return useQuery<Jobs.RespJobHistory, Error>(
    [QueryKeys.history, params, basePath, jwt],
    () => API.getHistory(params, basePath, jwt),
    {
      enabled: !!params.jobUuid && !!jwt,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      ...options,
    }
  );
};

export default useJobHistory;
