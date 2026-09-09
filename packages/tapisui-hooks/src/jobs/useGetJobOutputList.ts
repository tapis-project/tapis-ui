import { useQuery, QueryObserverOptions } from 'react-query';
import { Jobs as API } from '@tapis/tapisui-api';
import { Jobs } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';
import { detailPolicy } from '../utils/cachePolicy';

const useGetJobOutputList = (
  params: Jobs.GetJobOutputListRequest,
  options: QueryObserverOptions<Jobs.RespGetJobOutputList, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Jobs.RespGetJobOutputList, Error>(
    [QueryKeys.outputList, params, accessToken],
    () =>
      API.getJobOutputList(params, basePath, accessToken?.access_token ?? ''),
    {
      ...detailPolicy(),
      ...options,
      enabled: (options.enabled ?? true) && !!accessToken,
    }
  );
  return result;
};

export default useGetJobOutputList;
