import * as Deployments from '@mlhub/deployments-ts-sdk';
import { apiGenerator, errorDecoder } from '../../utils';

const undeployModelDeployment = (
  params: Deployments.UndeployModelDeploymentRequest,
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
    api.undeployModelDeployment(params)
  );
};

export default undeployModelDeployment;
