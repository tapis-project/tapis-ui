import { useQuery, QueryObserverOptions } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../../../';
import QueryKeys from './queryKeys';

export interface PlatformCapabilities {
  name: string;
  capabilities: string[];
}

const useList = (
  options: QueryObserverOptions<PlatformCapabilities[], Error> = {}
) => {
  const { accessToken, basePath, mlHubBasePath } = useTapisConfig();

  console.log({ mlHubBasePath });

  const result = useQuery<PlatformCapabilities[], Error>(
    [QueryKeys.list, accessToken],
    async () => {
      if (!accessToken?.access_token) {
        throw new Error('No access token available');
      }

      const response = await API.Models.Platforms.list(
        mlHubBasePath,
        accessToken.access_token
      );

      if (response.result && response.result.length > 0) {
        return response.result.map((platformDetails: any) => ({
          name: platformDetails.name,
          capabilities: platformDetails.capabilities || [],
        }));
      }

      throw new Error('No platforms found in response');
    },
    {
      ...options,
      enabled: !!accessToken?.access_token,
    }
  );

  return result;
};

export default useList;
