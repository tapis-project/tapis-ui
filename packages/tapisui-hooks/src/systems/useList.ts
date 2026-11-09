import { useQuery, QueryObserverOptions } from 'react-query';
import { Systems as API } from '@tapis/tapisui-api';
import { Systems } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';
import { noBackgroundRefetch } from '../utils/cachePolicy';

export const defaultParams: Systems.GetSystemsRequest = {
  listType: Systems.ListTypeEnum.All,
};

const useList = (
  params: Systems.GetSystemsRequest = defaultParams,
  options: QueryObserverOptions<Systems.RespSystems, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Systems.RespSystems, Error>(
    [QueryKeys.list, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () => API.list(params, basePath, accessToken?.access_token || ''),
    {
      ...noBackgroundRefetch,
      refetchOnMount: false,
      ...options,
      enabled: (options.enabled ?? true) && !!accessToken,
    }
  );
  return result;
};

export default useList;
