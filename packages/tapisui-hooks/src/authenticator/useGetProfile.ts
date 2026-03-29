import { useQuery, QueryObserverOptions, useQueryClient } from 'react-query';
import { Authenticator as API } from '@tapis/tapisui-api';
import { Authenticator } from '@tapis/tapis-typescript';
import { useTapisConfig } from '..';
import QueryKeys from './queryKeys';

const useGetProfile = (
  params: Authenticator.GetProfileRequest,
  options: QueryObserverOptions<Authenticator.RespGetProfile, Error> = {}
) => {
  const queryClient = useQueryClient();
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Authenticator.RespGetProfile, Error>(
    [QueryKeys.getProfile, params, accessToken],
    () => API.getProfile(params, basePath, accessToken?.access_token ?? ''),
    {
      refetchIntervalInBackground: false,
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      enabled: !!accessToken && !!params.username,
      ...options,
    }
  );

  const invalidate = () => {
    queryClient.invalidateQueries([QueryKeys.getProfile]);
  };

  return { ...result, invalidate };
};

export default useGetProfile;
