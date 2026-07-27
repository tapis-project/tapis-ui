import { useQuery, QueryObserverOptions } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api';
import * as Deployments from '@mlhub/deployments-ts-sdk';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';

const useList = (
  options: QueryObserverOptions<
    Deployments.ListModelDeploymentsResponse,
    Error
  > = {}
) => {
  const { accessToken, mlHubBasePath } = useTapisConfig();
  const result = useQuery<Deployments.ListModelDeploymentsResponse, Error>(
    [QueryKeys.listDeployments, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () =>
      API.Deployments.listModelDeployments(
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
