import * as Deployments from '@mlhub/deployments-ts-sdk';
import { apiGenerator, errorDecoder } from '../../../utils';

const getHpcCluster = (
  params: Deployments.GetHpcClusterRequest,
  basePath: string,
  jwt: string
) => {
  const api = apiGenerator<Deployments.TargetsApi>(
    Deployments,
    Deployments.TargetsApi,
    basePath,
    jwt
  );

  return errorDecoder<Deployments.GetHpcClusterResponse>(() =>
    api.getHpcCluster(params)
  );
};

export default getHpcCluster;
