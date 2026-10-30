import * as Deployments from '@mlhub/deployments-ts-sdk';
import { apiGenerator, errorDecoder } from '../../utils';

const stopModelDeployment = (
  params: Deployments.StopModelDeploymentRequest,
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
    api.stopModelDeployment(params)
  );
};

export default stopModelDeployment;
