import { useQuery, QueryObserverOptions } from 'react-query';
import { Jobs as API } from '@tapis/tapisui-api';
import { Jobs } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';

const useDetails = (
  jobUuid: string,
  options: QueryObserverOptions<Jobs.RespGetJob, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const params: Jobs.GetJobRequest = { jobUuid };
  const result = useQuery<Jobs.RespGetJob, Error>(
    [QueryKeys.details, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () => API.details(params, basePath, accessToken?.access_token ?? ''),
    {
      ...options,
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useDetails;
