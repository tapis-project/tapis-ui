import { useQuery, QueryObserverOptions, useQueryClient } from 'react-query';
import { Pods as API } from '@tapis/tapisui-api';
import { Pods } from '@tapis/tapis-typescript';
import { useTapisConfig } from '..';
import QueryKeys from './queryKeys';

const useGetTemplatePermissions = (
  params: Pods.GetTemplatePermissionsRequest,
  options: QueryObserverOptions<Pods.TemplatePermissionsResponse, Error> = {}
) => {
  const queryClient = useQueryClient();
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Pods.TemplatePermissionsResponse, Error>(
    [QueryKeys.getTemplatePermissions, params, accessToken],
    () =>
      API.getTemplatePermissions(
        params,
        basePath,
        accessToken?.access_token ?? ''
      ),
    {
      refetchIntervalInBackground: false,
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      enabled: !!accessToken,
      ...options,
    }
  );
  const invalidate = () => {
    queryClient.invalidateQueries([QueryKeys.getTemplatePermissions]);
  };

  return { ...result, invalidate };
};

export default useGetTemplatePermissions;
