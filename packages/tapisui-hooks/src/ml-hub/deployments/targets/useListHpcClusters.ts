import { QueryObserverOptions, useQuery } from 'react-query';
import * as Deployments from '@mlhub/deployments-ts-sdk';
import { MLHub as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../../..';
import QueryKeys from '../queryKeys';

const useListHpcClusters = (
  params: Deployments.ListHpcClustersRequest,
  options: QueryObserverOptions<Deployments.ListHpcClustersResponse, Error> = {}
) => {
  const { accessToken, mlHubBasePath } = useTapisConfig();

  return useQuery<Deployments.ListHpcClustersResponse, Error>(
    [QueryKeys.listHpcClusters, params, accessToken],
    () =>
      API.Deployments.Targets.listHpcClusters(
        params,
        mlHubBasePath,
        accessToken?.access_token ?? ''
      ),
    { ...options, enabled: !!accessToken && options.enabled !== false }
  );
};

export default useListHpcClusters;
