import { useQuery, QueryObserverOptions } from 'react-query';
import { Jobs as API } from '@tapis/tapisui-api';
import { Jobs } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';
import { detailPolicy } from '../utils/cachePolicy';

export const defaultParams: Jobs.GetJobListRequest = {
  orderBy: 'created(desc)',
};

const useSearchSQL = (
  params: Jobs.GetJobSearchListByPostSqlStrRequest = defaultParams,
  options: QueryObserverOptions<Jobs.RespJobSearchAllAttributes, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Jobs.RespJobSearchAllAttributes, Error>(
    [QueryKeys.searchSQL, params, accessToken],
    () => API.searchSQL(params, basePath, accessToken?.access_token ?? ''),
    {
      ...detailPolicy(),
      ...options,
      enabled: (options.enabled ?? true) && !!accessToken,
    }
  );
  return result;
};

export default useSearchSQL;
