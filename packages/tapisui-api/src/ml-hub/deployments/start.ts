import * as Deployments from '@mlhub/deployments-ts-sdk';
import { apiGenerator, errorDecoder } from '../../utils';

const startModelDeployment = (
  params: Deployments.StartModelDeploymentRequest,
  basePath: string,
  jwt: string
) => {
  const api = apiGenerator<Deployments.DeploymentsApi>(
    Deployments,
    Deployments.DeploymentsApi,
    basePath,
    jwt
  );

  return errorDecoder<Deployments.ModelDeploymentResponse>(() =>
    api.startModelDeployment(params)
  );
};

export default startModelDeployment;
