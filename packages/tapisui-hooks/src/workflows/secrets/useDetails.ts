import { useQuery, QueryObserverOptions } from 'react-query';
import { Workflows as API } from '@tapis/tapisui-api';
import { Workflows } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';

const useDetails = (
  params: Workflows.GetSecretRequest,
  options: QueryObserverOptions<Workflows.RespSecret, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Workflows.RespSecret, Error>(
    [QueryKeys.details, accessToken],
    // Default to no token. This will generate a 403 when calling the details function
    // which is expected behavior for not having a token
    () =>
      API.Secrets.details(basePath, accessToken?.access_token || '', params),
    {
      ...options,
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useDetails;
