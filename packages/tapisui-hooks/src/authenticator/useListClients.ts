import { useQuery, QueryObserverOptions } from 'react-query';
import { Authenticator as API } from '@tapis/tapisui-api';
import { Authenticator } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';

const useListClients = (params: Authenticator.ListClientsRequest = {}) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Authenticator.RespListClients, Error>(
    [QueryKeys.listClients, accessToken, params],
    () => API.listClients(params, basePath, accessToken?.access_token!)
  );

  return result;
};

export default useListClients;
