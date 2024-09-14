import { useQuery, QueryObserverOptions } from 'react-query';
import { Workflows as API } from '@tapis/tapisui-api';
import { Workflows } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';

const useDetails = (
  params: Workflows.GetGroupSecretRequest,
  options: QueryObserverOptions<Workflows.RespGroupSecret, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Workflows.RespGroupSecret, Error>(
    [QueryKeys.details, accessToken],
    // Default to no token. This will generate a 403 when calling the details function
    // which is expected behavior for not having a token
    () =>
      API.GroupSecrets.details(
        basePath,
        accessToken?.access_token || '',
        params
      ),
    {
      ...options,
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useDetails;
