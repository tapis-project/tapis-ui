import { useQuery, QueryObserverOptions, useQueryClient } from 'react-query';
import { Pods as API } from '@tapis/tapisui-api';
import { Pods } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';

const useLogs = (
  params: Pods.GetPodLogsRequest,
  options: QueryObserverOptions<Pods.PodLogsResponse, Error> = {}
) => {
  const queryClient = useQueryClient(); // Get the queryClient instance
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Pods.PodLogsResponse, Error>(
    [QueryKeys.getLogs, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () => API.logs(params, basePath, accessToken?.access_token ?? ''),
    {
      // Disable automatic refetching on window focus, mount, and reconnect
      refetchIntervalInBackground: false,
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 20000,
      cacheTime: 20000,
      // Keep the enabled option to control query activation based on accessToken presence
      enabled: !!accessToken,
    }
  );

  const invalidate = () => {
    queryClient.invalidateQueries([QueryKeys.getLogs]);
  };

  return { ...result, invalidate };
};

export default useLogs;
