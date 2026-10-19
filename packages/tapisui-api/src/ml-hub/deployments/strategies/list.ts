import * as Deployments from '@mlhub/deployments-ts-sdk';
import { apiGenerator, errorDecoder } from '../../../utils';

const list = (basePath: string, jwt: string) => {
  const api: Deployments.StrategiesApi =
    apiGenerator<Deployments.StrategiesApi>(
      Deployments,
      Deployments.StrategiesApi,
      basePath,
      jwt
    );
  return errorDecoder<Deployments.ListDeploymentStrategiesResponse>(() =>
    api.listStrategies()
  );
};

export default list;
