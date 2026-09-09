import { useQuery, QueryObserverOptions } from 'react-query';
import { Tenants as API } from '@tapis/tapisui-api';
import { Tenants } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';

export const defaultParams: Tenants.ListOwnersRequest = {};

const useListOwners = (
  params: Tenants.ListOwnersRequest = defaultParams,
  options: QueryObserverOptions<Tenants.RespListOwners, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Tenants.RespListOwners, Error>(
    [QueryKeys.listOwners, params, accessToken],
    () => API.listOwners(params, basePath, accessToken?.access_token || ''),
    {
      enabled: !!accessToken,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      ...options,
    }
  );
  return result;
};

export default useListOwners;
