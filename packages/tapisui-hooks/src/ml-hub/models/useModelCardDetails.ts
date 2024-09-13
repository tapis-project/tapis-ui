import { useQuery, QueryObserverOptions } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api';
import { Models } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';

const useModelCardDetails = (
  params: Models.GetModelCardRequest,
  options: QueryObserverOptions<Models.RespModelCard, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Models.RespModelCard, Error>(
    [QueryKeys.modelCardDetails, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () =>
      API.Models.modelCardDetails(
        params,
        basePath,
        accessToken?.access_token ?? ''
      ),
    {
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useModelCardDetails;
