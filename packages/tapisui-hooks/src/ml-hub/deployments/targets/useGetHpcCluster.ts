import { QueryObserverOptions, useQuery } from 'react-query';
import * as Deployments from '@mlhub/deployments-ts-sdk';
import { MLHub as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../../..';
import QueryKeys from '../queryKeys';

const useGetHpcCluster = (
  params: Deployments.GetHpcClusterRequest | undefined,
  options: QueryObserverOptions<Deployments.GetHpcClusterResponse, Error> = {}
) => {
  const { accessToken, mlHubBasePath } = useTapisConfig();

  return useQuery<Deployments.GetHpcClusterResponse, Error>(
    [QueryKeys.getHpcCluster, params, accessToken],
    () =>
      API.Deployments.Targets.getHpcCluster(
        params as Deployments.GetHpcClusterRequest,
        mlHubBasePath,
        accessToken?.access_token ?? ''
      ),
    {
      ...options,
      enabled: !!accessToken && !!params && options.enabled !== false,
    }
  );
};

export default useGetHpcCluster;
