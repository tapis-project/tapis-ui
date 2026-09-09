import { useQuery, UseQueryOptions } from 'react-query';
import { Jobs } from '@tapis/tapis-typescript';
import { Jobs as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';

/**
 * Who holds what on this job. Load-on-need: the panel asks only when it is
 * open, because most job pages are opened to read a run, not to audit it.
 */
const useJobShare = (
  params: Jobs.GetJobShareRequest,
  options?: UseQueryOptions<Jobs.RespGetJobShareList, Error>
) => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  return useQuery<Jobs.RespGetJobShareList, Error>(
    [QueryKeys.share, params, basePath, jwt],
    () => API.getJobShare(params, basePath, jwt),
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

export default useJobShare;
