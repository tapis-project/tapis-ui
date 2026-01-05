import { useQuery, QueryObserverOptions } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api';
import { Models } from '@mlhub/ts-sdk';
import { useTapisConfig } from '../../../';
import QueryKeys from './queryKeys';

export interface GetModelByPlatformParams {
  platform: string;
  modelId: string;
}

const useGetModelByPlatform = (
  params: GetModelByPlatformParams,
  options: QueryObserverOptions<Models.GetModelByPlatformResponse, Error> = {}
) => {
  const { accessToken, basePath, mlHubBasePath } = useTapisConfig();

  const result = useQuery<Models.GetModelByPlatformResponse, Error>(
    [
      QueryKeys.getModelByPlatform,
      params.platform,
      params.modelId,
      accessToken,
    ],
    async () => {
      if (!accessToken?.access_token) {
        throw new Error('No access token available');
      }

      const response = await API.Models.Platforms.getModelByPlatform(
        params.platform,
        params.modelId,
        mlHubBasePath,
        accessToken.access_token
      );

      return response;
    },
    {
      ...options,
      enabled:
        !!accessToken?.access_token && !!params.platform && !!params.modelId,
    }
  );

  return result;
};

export default useGetModelByPlatform;
