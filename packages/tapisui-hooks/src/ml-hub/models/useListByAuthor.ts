import { useQuery, QueryObserverOptions } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api';
import * as Models from '@mlhub/models-ts-sdk';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';

const useListByAuthor = (
  params: Models.ListModelsByAuthorRequest,
  options: QueryObserverOptions<Models.ListModelsResponse, Error> = {}
) => {
  const { accessToken, mlHubBasePath } = useTapisConfig();
  const result = useQuery<Models.ListModelsResponse, Error>(
    [QueryKeys.listByAuthor, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () =>
      API.Models.listByAuthor(
        params,
        mlHubBasePath,
        accessToken?.access_token ?? ''
      ),
    {
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useListByAuthor;
