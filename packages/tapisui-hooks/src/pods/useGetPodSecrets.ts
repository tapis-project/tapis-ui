import { useQuery, QueryObserverOptions, useQueryClient } from 'react-query';
import { Pods as API } from '@tapis/tapisui-api';
import { Pods } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';

const useGetPodSecrets = (
  params: Pods.GetPodCredentialsRequest,
  options: QueryObserverOptions<Pods.PodCredentialsResponse, Error> = {}
) => {
  const queryClient = useQueryClient(); // Get the queryClient instance
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Pods.PodCredentialsResponse, Error>(
    [QueryKeys.getPodSecrets, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () => API.getPodSecrets(params, basePath, accessToken?.access_token ?? ''),
    {
      // Disable automatic refetching on window focus, mount, and reconnect
      refetchIntervalInBackground: false,
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 20000, // 20 seconds
      cacheTime: 20000, // 20 seconds
      // Keep the enabled option to control query activation based on accessToken presence
      enabled: !!accessToken,
      // Spread any user-provided options to allow for customization
      ...options,
    }
  );

  const invalidate = () => {
    queryClient.invalidateQueries([QueryKeys.getPodSecrets]);
  };

  return { ...result, invalidate };
};

export default useGetPodSecrets;
