import { useQuery, QueryObserverOptions } from 'react-query';
import { Apps } from '@tapis/tapis-typescript';
import { Apps as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';
import { noBackgroundRefetch } from '../utils/cachePolicy';

// Who an app is shared with — result.public is the "usable by the whole
// tenant" bit the store's already-registered note reads.
const useShareInfo = (
  appId: string,
  options: QueryObserverOptions<Apps.RespShareInfo, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  return useQuery<Apps.RespShareInfo, Error>(
    [QueryKeys.shareInfo, appId, accessToken],
    () => API.getShareInfo(appId, basePath, accessToken?.access_token ?? ''),
    {
      ...noBackgroundRefetch,
      refetchOnMount: false,
      ...options,
      enabled: (options.enabled ?? true) && !!accessToken && !!appId,
    }
  );
};

export default useShareInfo;
