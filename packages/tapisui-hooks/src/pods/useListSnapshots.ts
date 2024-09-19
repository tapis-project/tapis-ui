import { useQuery, QueryObserverOptions } from 'react-query';
import { Pods as API } from '@tapis/tapisui-api';
import { Pods } from '@tapis/tapis-typescript';
import { useTapisConfig } from '..';
import QueryKeys from './queryKeys';

const useListSnapshots = (
  options: QueryObserverOptions<Pods.SnapshotsResponse, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Pods.SnapshotsResponse, Error>(
    [QueryKeys.listSnapshots, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () => API.listSnapshots(basePath, accessToken?.access_token || ''),
    {
      ...options,
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useListSnapshots;
