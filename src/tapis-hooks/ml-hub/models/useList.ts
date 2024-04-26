import { useQuery, QueryObserverOptions } from 'react-query';
import { list } from 'tapis-api/ml-hub/models';
import { Models } from '@tapis/tapis-typescript';
import { useTapisConfig } from 'tapis-hooks';
import QueryKeys from './queryKeys';
import basePath from './modelsPath'; // remove if ml-hub is listed in NGINX

const useList = (
    options: QueryObserverOptions<Models.RespModelObject, Error> = {}
  ) => {
    // const { accessToken, basePath } = useTapisConfig();
    const { accessToken } = useTapisConfig(); // remove and uncomment line above if ml-hub is listed in NGINX
    const result = useQuery<Models.RespModelObject, Error>(
      [QueryKeys.list, accessToken],
      // Default to no token. This will generate a 403 when calling the list function
      // which is expected behavior for not having a token
      () => list(basePath, accessToken?.access_token || ''),
      {
        ...options,
        enabled: !!accessToken,
      }
    );
    return result;
  };
  
  export default useList;