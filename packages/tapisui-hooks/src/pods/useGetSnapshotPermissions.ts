import { useQuery, QueryObserverOptions, useQueryClient } from 'react-query';
import { Pods as API } from '@tapis/tapisui-api';
import { Pods } from '@tapis/tapis-typescript';
import { useTapisConfig } from '..';
import QueryKeys from './queryKeys';

const useGetSnapshotPermissions = (
  params: Pods.GetSnapshotPermissionsRequest,
  options: QueryObserverOptions<Pods.SnapshotPermissionsResponse, Error> = {}
) => {
  const queryClient = useQueryClient(); // Get the queryClient instance
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Pods.SnapshotPermissionsResponse, Error>(
    [QueryKeys.getSnapshotPermissions, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () =>
      API.getSnapshotPermissions(
        params,
        basePath,
        accessToken?.access_token ?? ''
      ),
    {
      // Disable automatic refetching on window focus, mount, and reconnect
      refetchIntervalInBackground: false,
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      // staleTime: 100000, // 30 seconds
      // cacheTime: 10000,
      // Keep the enabled option to control query activation based on accessToken presence
      enabled: !!accessToken,
      // Spread any user-provided options to allow for customization
      ...options,
    }
  );
  const invalidate = () => {
    queryClient.invalidateQueries([QueryKeys.getSnapshotPermissions]);
  };

  return { ...result, invalidate };
};

export default useGetSnapshotPermissions;
