import { useQuery, QueryObserverOptions } from 'react-query';
import { Apps as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';

export type UserPermsMap = Record<string, Array<string>>;

/**
 * Every shared user's permissions on one app, as a single cache entry.
 * The Apps API only answers per-user, so the fan-out happens inside the
 * query fn — one key, one refetch, not a cache entry per user. A user
 * whose lookup is refused maps to an empty list rather than failing the
 * whole map.
 *
 * The unwrap is the part worth keeping: RespNameArray nests the list at
 * result.names, and reading result directly hands the panel an object
 * where it expects an array — which is exactly the crash the systems
 * twin shipped once already.
 */
const useAppUserPermsMap = (
  params: { appId: string; users: Array<string> },
  options: QueryObserverOptions<UserPermsMap, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const users = Array.from(new Set(params.users)).sort();
  return useQuery<UserPermsMap, Error>(
    [QueryKeys.userPermsMap, params.appId, users, accessToken],
    async () => {
      const entries = await Promise.all(
        users.map(async (userName) => {
          try {
            const resp = await API.getUserPerms(
              { appId: params.appId, userName },
              basePath,
              jwt
            );
            return [userName, resp.result?.names ?? []] as const;
          } catch {
            return [userName, []] as const;
          }
        })
      );
      return Object.fromEntries(entries) as UserPermsMap;
    },
    {
      enabled: !!accessToken && !!params.appId && users.length > 0,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      ...options,
    }
  );
};

export default useAppUserPermsMap;
