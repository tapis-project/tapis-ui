import { useQuery, QueryObserverOptions } from 'react-query';
import { Systems } from '@tapis/tapis-typescript';
import { Systems as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '..';
import QueryKeys from './queryKeys';

// POST /v3/systems/credential/{systemId}/user/{userName}/check — a REAL
// connection attempt to the host (LINUX and S3 systems only), not a registry
// lookup. Ship it disabled and call refetch() on demand: this is an expensive
// server-side action that must never run because a component mounted.
const useCheckCredential = (
  params: Omit<Systems.CheckUserCredentialRequest, 'userName'>,
  options: QueryObserverOptions<Systems.RespBasic, Error> = {}
) => {
  const { accessToken, basePath, claims } = useTapisConfig();
  const result = useQuery<Systems.RespBasic, Error>(
    [QueryKeys.checkUserCredential, params, accessToken],
    () =>
      API.checkUserCredential(
        {
          ...params,
          userName: claims['tapis/username'],
        },
        basePath,
        accessToken?.access_token || ''
      ),
    {
      retry: 0,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      ...options,
      // caller's enabled is honored, but never without a token — the old
      // version spread options first and silently overrode enabled:false
      enabled: !!accessToken && (options.enabled ?? true),
    }
  );
  return result;
};

export default useCheckCredential;
