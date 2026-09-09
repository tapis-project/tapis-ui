import { useQuery, QueryObserverOptions } from 'react-query';
import { Systems as API } from '@tapis/tapisui-api';
import { Systems } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';
import { detailPolicy } from '../utils/cachePolicy';

const useSchedulerProfiles = (
  options: QueryObserverOptions<Systems.RespSchedulerProfiles, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Systems.RespSchedulerProfiles, Error>(
    [QueryKeys.listSchedulerProfiles, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () => API.listSchedulerProfiles(basePath, accessToken?.access_token || ''),
    {
      ...detailPolicy(),
      ...options,
      enabled: (options.enabled ?? true) && !!accessToken,
    }
  );
  return result;
};

export default useSchedulerProfiles;
