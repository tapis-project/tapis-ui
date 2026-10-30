import * as Endpoints from '@mlhub/endpoints-ts-sdk';
import { apiGenerator, errorDecoder } from '../../utils';

const healthcheck = (basePath: string, jwt: string) => {
  const api = apiGenerator<Endpoints.HealthApi>(
    Endpoints,
    Endpoints.HealthApi,
    basePath,
    jwt
  );

  return errorDecoder<void>(() => api.healthcheck());
};

export default healthcheck;
