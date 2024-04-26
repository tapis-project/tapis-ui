import { useQuery, QueryObserverOptions } from 'react-query';
import { listByAuthor } from 'tapis-api/ml-hub/models';
import { Models } from '@tapis/tapis-typescript';
import { useTapisConfig } from 'tapis-hooks';
import QueryKeys from './queryKeys';
import basePath from './modelsPath'; // remove if ml-hub is listed in NGINX

const useListByAuthor = (
  params: Models.ListModelsByAuthorRequest,
  options: QueryObserverOptions<Models.RespModelObject, Error> = {}
) => {
  // const { accessToken, basePath } = useTapisConfig();
  const { accessToken } = useTapisConfig(); // remove this line and uncomment line above if ml-hub is listed in NGINX
  const result = useQuery<Models.RespModelObject, Error>(
    [QueryKeys.listByAuthor, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () => listByAuthor(params, basePath, accessToken?.access_token ?? ''),
    {
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useListByAuthor;

