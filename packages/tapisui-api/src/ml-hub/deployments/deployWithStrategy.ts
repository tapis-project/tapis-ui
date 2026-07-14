import * as Deployments from '@mlhub/deployments-ts-sdk';
import { apiGenerator, errorDecoder } from '../../utils';

const deployWithStrategy = (
  params: Deployments.DeployModelWithStrategyRequest,
  basePath: string,
  jwt: string
) => {
  const api: Deployments.DeploymentsApi =
    apiGenerator<Deployments.DeploymentsApi>(
      Deployments,
      Deployments.DeploymentsApi,
      basePath,
      jwt
    );
  return errorDecoder<Deployments.ModelDeploymentResponse>(() =>
    api.deployModelWithStrategy(params)
  );
};

export default deployWithStrategy;
