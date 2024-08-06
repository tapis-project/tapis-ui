import { useQuery, QueryObserverOptions } from 'react-query';
import { Apps as API } from '@tapis/tapisui-api';
import { Apps } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';

export const defaultParams: Apps.GetAppsRequest = {
  select: 'jobAttributes,version',
};

const useList = (
  params: Apps.GetAppsRequest = defaultParams,
  options: QueryObserverOptions<Apps.RespApps, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Apps.RespApps, Error>(
    [QueryKeys.list, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () => API.list(params, basePath, accessToken?.access_token ?? ''),
    {
      ...options,
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useList;
