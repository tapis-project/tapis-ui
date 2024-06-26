import { useQuery, QueryObserverOptions } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api';
import { Models } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';
import basePath from './basePath'; // remove if ml-hub is listed in NGINX

const useList = (
  options: QueryObserverOptions<Models.RespModelsObject, Error> = {}
) => {
  // const { accessToken, basePath } = useTapisConfig();
  const { accessToken } = useTapisConfig(); // remove  this line and uncomment line above if ml-hub is listed in NGINX
  const result = useQuery<Models.RespModelsObject, Error>(
    [QueryKeys.list, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () => API.Models.list(basePath, accessToken?.access_token || ''),
    {
      ...options,
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useList;
