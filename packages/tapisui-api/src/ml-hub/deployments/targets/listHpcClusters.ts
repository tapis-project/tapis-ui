import * as Deployments from '@mlhub/deployments-ts-sdk';
import { apiGenerator, errorDecoder } from '../../../utils';

const listHpcClusters = (
  params: Deployments.ListHpcClustersRequest,
  basePath: string,
  jwt: string
) => {
  const api = apiGenerator<Deployments.TargetsApi>(
    Deployments,
    Deployments.TargetsApi,
    basePath,
    jwt
  );

  return errorDecoder<Deployments.ListHpcClustersResponse>(() =>
    api.listHpcClusters(params)
  );
};

export default listHpcClusters;
