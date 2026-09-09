import { useQuery, QueryObserverOptions } from 'react-query';
import { Systems as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';

export type UserPermsMap = Record<string, Array<string>>;

/**
 * Every listed user's permissions on one system, as a single cache entry.
 * The Systems API only answers per-user, so the fan-out happens inside the
 * query fn — one key, one refetch, not a cache entry per user. A user whose
 * lookup is refused (not the owner asking, say) maps to an empty list
 * rather than failing the whole map.
 */
const useUserPermsMap = (
  params: { systemId: string; users: Array<string> },
  options: QueryObserverOptions<UserPermsMap, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const users = Array.from(new Set(params.users)).sort();
  return useQuery<UserPermsMap, Error>(
    [QueryKeys.userPermsMap, params.systemId, users, accessToken],
    async () => {
      const entries = await Promise.all(
        users.map(async (userName) => {
          try {
            const resp = await API.getUserPerms(
              { systemId: params.systemId, userName },
              basePath,
              jwt
            );
            // RespNameArray nests the list: result = { names: [...] }
            return [userName, resp.result?.names ?? []] as const;
          } catch {
            return [userName, []] as const;
          }
        })
      );
      return Object.fromEntries(entries);
    },
    {
      enabled: !!accessToken && !!params.systemId && users.length > 0,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      ...options,
    }
  );
};

export default useUserPermsMap;
