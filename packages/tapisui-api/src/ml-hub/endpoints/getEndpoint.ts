import * as Endpoints from '@mlhub/endpoints-ts-sdk';
import { apiGenerator, errorDecoder } from '../../utils';

export type GetEndpointParams = Parameters<
  Endpoints.EndpointsApi['getEndpoint']
>[0];

const getEndpoint = (
  params: GetEndpointParams,
  basePath: string,
  jwt: string
) => {
  const api = apiGenerator<Endpoints.EndpointsApi>(
    Endpoints,
    Endpoints.EndpointsApi,
    basePath,
    jwt
  );

  return errorDecoder<Endpoints.GetEndpointResponse>(() =>
    api.getEndpoint(params)
  );
};

export default getEndpoint;
