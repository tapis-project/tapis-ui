import { useQuery, QueryObserverOptions } from 'react-query';
import { Tenants as API } from '@tapis/tapisui-api';
import { Tenants } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';

export const defaultParams: Tenants.ListTenantsRequest = {};

const useList = (
  params: Tenants.ListTenantsRequest = defaultParams,
  options: QueryObserverOptions<Tenants.RespListTenants, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Tenants.RespListTenants, Error>(
    [QueryKeys.list, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () => API.list(params, basePath, accessToken?.access_token || ''),
    {
      ...options,
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useList;
