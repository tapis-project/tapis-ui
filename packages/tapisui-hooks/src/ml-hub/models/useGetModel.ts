import { useQuery, QueryObserverOptions } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api';
import * as Models from '@mlhub/models-ts-sdk';
import { useTapisConfig } from '../..';
import QueryKeys from './queryKeys';

const useGetModel = (
  params: Models.GetModelByAuthorAndNameRequest,
  options: QueryObserverOptions<Models.GetModelResponse, Error> = {}
) => {
  const { accessToken, mlHubBasePath } = useTapisConfig();
  const result = useQuery<Models.GetModelResponse, Error>(
    [QueryKeys.getByAuthorAndName, params, accessToken],
    () =>
      API.Models.getByAuthorAndName(
        params,
        mlHubBasePath,
        accessToken?.access_token ?? ''
      ),
    {
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useGetModel;
