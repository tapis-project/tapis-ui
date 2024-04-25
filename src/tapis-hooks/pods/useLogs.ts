import { useQuery, QueryObserverOptions } from 'react-query';
import { logs } from 'tapis-api/pods';
import { Pods } from '@tapis/tapis-typescript';
import { useTapisConfig } from 'tapis-hooks';
import QueryKeys from './queryKeys';

const useLogs = (
  params: Pods.GetPodLogsRequest,
  options: QueryObserverOptions<Pods.PodLogsResponse, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Pods.PodLogsResponse, Error>(
    [QueryKeys.getLogs, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () => logs(params, basePath, accessToken?.access_token ?? ''),
    {
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useLogs;
