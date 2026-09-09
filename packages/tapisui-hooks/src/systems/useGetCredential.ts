import { useQuery, QueryObserverOptions } from 'react-query';
import { Systems } from '@tapis/tapis-typescript';
import { Systems as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '..';
import QueryKeys from './queryKeys';
import { noBackgroundRefetch } from '../utils/cachePolicy';

// GET /v3/systems/credential/{systemId}/user/{userName} — the registry
// half of a credential check: does one exist, and of what kinds. Cheap
// (no host connection), but still shipped disabled-by-caller: it answers
// a press, not a mount. checkUserCredential is the expensive dialing half.
const useGetCredential = (
  params: Omit<Systems.GetUserCredentialRequest, 'userName'>,
  options: QueryObserverOptions<Systems.RespCredential, Error> = {}
) => {
  const { accessToken, basePath, claims } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  return useQuery<Systems.RespCredential, Error>(
    [QueryKeys.getUserCredential, params, accessToken],
    () =>
      API.getUserCredential(
        { ...params, userName: claims['tapis/username'] },
        basePath,
        jwt
      ),
    {
      retry: 0,
      ...noBackgroundRefetch,
      refetchOnMount: false,
      ...options,
      enabled: !!accessToken && (options.enabled ?? true),
    }
  );
};

export default useGetCredential;
