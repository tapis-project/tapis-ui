import * as Endpoints from '@mlhub/endpoints-ts-sdk';
import { apiGenerator, errorDecoder } from '../../utils';

export type ListResourceEndpointsParams = Parameters<
  Endpoints.EndpointsApi['listResourceEndpoints']
>[0];

const listResourceEndpoints = (
  params: ListResourceEndpointsParams,
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
    api.listResourceEndpoints(params)
  );
};

export default listResourceEndpoints;
