import { useQuery, QueryObserverOptions } from 'react-query';
import { Workflows as API } from '@tapis/tapisui-api';
import { Workflows } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';

type UseListHookParams = {
  groupId: string;
};

const useList = (
  params: UseListHookParams,
  options: QueryObserverOptions<Workflows.RespGroupSecretList, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Workflows.RespGroupSecretList, Error>(
    [QueryKeys.list, accessToken],
    () =>
      API.GroupSecrets.list(basePath, accessToken?.access_token || '', params),
    {
      ...options,
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useList;
