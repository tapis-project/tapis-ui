import { useQuery, QueryObserverOptions } from 'react-query';
import { details } from 'tapis-api/pods';
import { Pods } from '@tapis/tapis-typescript';
import { useTapisConfig } from 'tapis-hooks';
import QueryKeys from './queryKeys';

const useDetails = (
  params: Pods.GetPodRequest,
  options: QueryObserverOptions<Pods.PodResponse, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Pods.PodResponse, Error>(
    [QueryKeys.details, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () => details(params, basePath, accessToken?.access_token ?? ''),
    {
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useDetails;
