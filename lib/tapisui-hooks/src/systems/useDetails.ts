import { useQuery, QueryObserverOptions } from 'react-query';
import { Systems as API } from '@tapis/tapisui-api';
import { Systems } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';

const useDetails = (
  params: Systems.GetSystemRequest,
  options: QueryObserverOptions<Systems.RespSystem, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Systems.RespSystem, Error>(
    [QueryKeys.details, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () => API.details(params, basePath, accessToken?.access_token ?? ''),
    {
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useDetails;
