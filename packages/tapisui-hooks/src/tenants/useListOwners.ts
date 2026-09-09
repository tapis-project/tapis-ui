import { useQuery, QueryObserverOptions } from 'react-query';
import { Tenants as API } from '@tapis/tapisui-api';
import { Tenants } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';
import { noBackgroundRefetch } from '../utils/cachePolicy';

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
      ...noBackgroundRefetch,
      refetchOnMount: false,
      ...options,
      enabled: (options.enabled ?? true) && !!accessToken,
    }
  );
  return result;
};

export default useListOwners;
