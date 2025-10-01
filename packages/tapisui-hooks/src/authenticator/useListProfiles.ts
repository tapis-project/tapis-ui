import { useQuery, QueryObserverOptions } from 'react-query';
import { Authenticator as API } from '@tapis/tapisui-api';
import { Authenticator } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';

export const defaultParams: Authenticator.ListProfilesRequest = {};

const useListProfiles = (
  params: Authenticator.ListProfilesRequest = defaultParams,
  options: QueryObserverOptions<Authenticator.RespListProfiles, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Authenticator.RespListProfiles, Error>(
    [QueryKeys.listProfiles, params, accessToken],
    () => API.listProfiles(params, basePath, accessToken?.access_token ?? ''),
    {
      ...options,
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useListProfiles;
