import * as Deployments from '@mlhub/deployments-ts-sdk';
import { apiGenerator, errorDecoder } from '../../utils';

const deployWithOption = (
  params: Deployments.DeployModelWithOptionRequest,
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
    api.deployModelWithOption(params)
  );
};

export default deployWithOption;
