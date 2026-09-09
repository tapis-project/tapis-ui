import { useQuery, QueryObserverOptions } from 'react-query';
import { Apps as API } from '@tapis/tapisui-api';
import { Apps } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';
import { detailPolicy } from '../utils/cachePolicy';

const useDetail = (
  params: Apps.GetAppRequest,
  options: QueryObserverOptions<Apps.RespApp, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Apps.RespApp, Error>(
    [QueryKeys.list, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () => API.detail({ ...params }, basePath, accessToken?.access_token ?? ''),
    {
      ...detailPolicy(),
      ...options,
      enabled: (options.enabled ?? true) && !!accessToken,
    }
  );
  return result;
};

export default useDetail;
