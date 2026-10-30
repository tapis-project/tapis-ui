import * as Deployments from '@mlhub/deployments-ts-sdk';
import { apiGenerator, errorDecoder } from '../../utils';

const list = (basePath: string, jwt: string) => {
  const api: Deployments.DeploymentsApi =
    apiGenerator<Deployments.DeploymentsApi>(
      Deployments,
      Deployments.DeploymentsApi,
      basePath,
      jwt
    );
  return errorDecoder<Deployments.ListModelDeploymentsResponse>(() =>
    api.listModelDeployments()
  );
};

export default list;
