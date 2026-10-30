import { QueryObserverOptions, useQuery } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../..';
import QueryKeys from './queryKeys';

const useHealthcheck = (options: QueryObserverOptions<void, Error> = {}) => {
  const { accessToken, mlHubBasePath } = useTapisConfig();

  return useQuery<void, Error>(
    [QueryKeys.healthcheck, accessToken],
    () =>
      API.Endpoints.healthcheck(mlHubBasePath, accessToken?.access_token ?? ''),
    {
      ...options,
      enabled: !!accessToken && options.enabled !== false,
    }
  );
};

export default useHealthcheck;
