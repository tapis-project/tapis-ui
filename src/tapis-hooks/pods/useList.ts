import { useQuery, QueryObserverOptions } from 'react-query';
import { list } from 'tapis-api/pods';
import { Pods } from '@tapis/tapis-typescript';
import { useTapisConfig } from 'tapis-hooks';
import QueryKeys from './queryKeys';

export const defaultParams = {};

const useList = (
  params = defaultParams,
  options: QueryObserverOptions<Pods.PodsResponse, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Pods.PodsResponse, Error>(
    [QueryKeys.list, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () => list(params, basePath, accessToken?.access_token || ''),
    {
      ...options,
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useList;
