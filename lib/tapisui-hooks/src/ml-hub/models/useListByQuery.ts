import { useQuery, QueryObserverOptions } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api';
import { Models } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';

const useListByQuery = (
  params: Models.ListModelsByQueryRequest,
  options: QueryObserverOptions<Models.RespModelsObject, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Models.RespModelsObject, Error>(
    [QueryKeys.listByQuery, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () =>
      API.Models.listByQuery(params, basePath, accessToken?.access_token ?? ''),
    {
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useListByQuery;
