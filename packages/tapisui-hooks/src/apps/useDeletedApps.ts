import { useQuery, QueryObserverOptions } from 'react-query';
import { Apps } from '@tapis/tapis-typescript';
import { Apps as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';

// Soft-deleted apps, which the ordinary list cannot see. Mirrors
// Systems.useDeletedList — the door that makes undelete reachable at all.
const useDeletedApps = (
  options: QueryObserverOptions<Apps.RespApps, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const params: Apps.GetAppsRequest = {
    search: 'deleted.eq.true',
    showDeleted: true,
    select: 'allAttributes',
  };
  return useQuery<Apps.RespApps, Error>(
    [QueryKeys.deletedList, accessToken],
    () => API.list(params, basePath, accessToken?.access_token ?? ''),
    {
      enabled: !!accessToken,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      ...options,
    }
  );
};

export default useDeletedApps;
