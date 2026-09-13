import { useQuery, QueryObserverOptions } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api';
import * as Models from '@mlhub/models-ts-sdk';
import { useTapisConfig } from '../..';
import QueryKeys from './queryKeys';

type GetModelParams =
  | Models.GetModelRequest
  | { author?: string; name?: string };

const useGetModel = (
  params: GetModelParams,
  options: QueryObserverOptions<Models.GetModelResponse, Error> = {}
) => {
  const { accessToken, mlHubBasePath } = useTapisConfig();
  const result = useQuery<Models.GetModelResponse, Error>(
    [QueryKeys.getByAuthorAndName, params, accessToken],
    () =>
      API.Models.getModel(
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
