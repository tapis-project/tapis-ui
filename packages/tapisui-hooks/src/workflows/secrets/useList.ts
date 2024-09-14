import { useQuery, QueryObserverOptions } from 'react-query';
import { Workflows as API } from '@tapis/tapisui-api';
import { Workflows } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';

const useList = (
  options: QueryObserverOptions<Workflows.RespSecretList, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Workflows.RespSecretList, Error>(
    [QueryKeys.list, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () => API.Secrets.list(basePath, accessToken?.access_token || ''),
    {
      ...options,
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useList;
