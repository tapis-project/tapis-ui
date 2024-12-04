import { useQuery, QueryObserverOptions } from 'react-query';
import { Authenticator as API } from '@tapis/tapisui-api';
import { Authenticator } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';
import { queryGenerator } from '../utils';

export const defaultParams: Authenticator.ListProfilesRequest = {};

const useListProfiles = (
  params: Authenticator.ListProfilesRequest = defaultParams,
  options: QueryObserverOptions<Authenticator.RespListProfiles, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Authenticator.RespListProfiles, Error>(
    [QueryKeys.listProfiles, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () => API.listProfiles(params, basePath, accessToken?.access_token ?? ''),
    {
      ...options,
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useListProfiles;
