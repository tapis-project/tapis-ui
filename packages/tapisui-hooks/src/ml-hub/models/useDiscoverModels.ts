import { useQuery, QueryObserverOptions } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api';
import { Models } from '@mlhub/ts-sdk';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';

const useDiscoverModels = (
  request: Models.DiscoverModelsRequest,
  options: QueryObserverOptions<Models.DiscoverModelsResponse, Error> = {}
) => {
  const { accessToken, basePath, mlHubBasePath } = useTapisConfig();
  const result = useQuery<Models.DiscoverModelsResponse, Error>(
    [QueryKeys.discover, accessToken],
    () =>
      API.Models.discover(
        request,
        mlHubBasePath,
        accessToken?.access_token || ''
      ),
    {
      ...options,
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useDiscoverModels;
