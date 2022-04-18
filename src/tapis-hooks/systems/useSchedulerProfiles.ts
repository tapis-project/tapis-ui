import { useQuery, QueryObserverOptions } from 'react-query';
import { listSchedulerProfiles } from 'tapis-api/systems';
import { Systems } from '@tapis/tapis-typescript';
import { useTapisConfig } from 'tapis-hooks';
import QueryKeys from './queryKeys';

const useSchedulerProfiles = (
  options: QueryObserverOptions<Systems.RespSchedulerProfiles, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Systems.RespSchedulerProfiles, Error>(
    [QueryKeys.listSchedulerProfiles, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () => listSchedulerProfiles(basePath, accessToken?.access_token || ''),
    {
      ...options,
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useSchedulerProfiles;
