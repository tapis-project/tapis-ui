import { useQuery, QueryObserverOptions } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api'
import { Models } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';
import basePath from './basePath'; // remove if ml-hub is listed in NGINX

const useListByLanguage = (
  params: Models.ListModelsByLanguageRequest,
  options: QueryObserverOptions<Models.RespModelObject, Error> = {}
) => {
  // const { accessToken, basePath } = useTapisConfig();
  const { accessToken } = useTapisConfig(); // remove this line and uncomment line above if ml-hub is listed in NGINX
  const result = useQuery<Models.RespModelObject, Error>(
    [QueryKeys.listByLanguage, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () => API.Models.listByLanguage(params, basePath, accessToken?.access_token ?? ''),
    {
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useListByLanguage;
