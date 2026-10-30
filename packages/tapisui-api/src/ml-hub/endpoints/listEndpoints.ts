import * as Endpoints from '@mlhub/endpoints-ts-sdk';
import { apiGenerator, errorDecoder } from '../../utils';

export type ListEndpointsParams = Parameters<
  Endpoints.EndpointsApi['listEndpoints']
>[0];

const listEndpoints = (
  params: ListEndpointsParams = {},
  basePath: string,
  jwt: string
) => {
  const api = apiGenerator<Endpoints.EndpointsApi>(
    Endpoints,
    Endpoints.EndpointsApi,
    basePath,
    jwt
  );

  return errorDecoder<Endpoints.ListEndpointsResponse>(() =>
    api.listEndpoints(params)
  );
};

export default listEndpoints;
