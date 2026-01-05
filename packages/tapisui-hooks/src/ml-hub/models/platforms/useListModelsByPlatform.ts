import { useQuery, QueryObserverOptions } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api';
import { Models } from '@mlhub/ts-sdk';
import { useTapisConfig } from '../../../';
import QueryKeys from './queryKeys';

export interface ListModelsByPlatformParams {
  platform: string;
}

const useListModelsByPlatform = (
  params: ListModelsByPlatformParams,
  options: QueryObserverOptions<Models.ListModelsByPlatformResponse, Error> = {}
) => {
  const { accessToken, basePath, mlHubBasePath } = useTapisConfig();

  const result = useQuery<Models.ListModelsByPlatformResponse, Error>(
    [QueryKeys.listModelsByPlatform, params.platform, accessToken],
    async () => {
      if (!accessToken?.access_token) {
        throw new Error('No access token available');
      }

      const response = await API.Models.Platforms.listModelsByPlatform(
        params.platform,
        mlHubBasePath,
        accessToken.access_token
      );

      return response;
    },
    {
      ...options,
      enabled: !!accessToken?.access_token && !!params.platform,
    }
  );

  return result;
};

export default useListModelsByPlatform;
