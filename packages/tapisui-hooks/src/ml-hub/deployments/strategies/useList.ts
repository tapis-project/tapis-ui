import { useQuery, QueryObserverOptions } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api';
import * as Deployments from '@mlhub/deployments-ts-sdk';
import { useTapisConfig } from '../../../';
import QueryKeys from '../queryKeys';

const useList = (
  options: QueryObserverOptions<
    Deployments.ListDeploymentStrategiesResponse,
    Error
  > = {}
) => {
  const { accessToken, mlHubBasePath } = useTapisConfig();
  const result = useQuery<Deployments.ListDeploymentStrategiesResponse, Error>(
    [QueryKeys.list, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () =>
      API.Deployments.Strategies.list(
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

export default useList;
