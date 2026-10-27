import { QueryObserverOptions, useQuery } from 'react-query';
import * as Endpoints from '@mlhub/endpoints-ts-sdk';
import { MLHub as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../..';
import QueryKeys from './queryKeys';

export type GetEndpointParams = Parameters<
  Endpoints.EndpointsApi['getEndpoint']
>[0];

const useGetEndpoint = (
  params: GetEndpointParams | undefined,
  options: QueryObserverOptions<Endpoints.GetEndpointResponse, Error> = {}
) => {
  const { accessToken, mlHubBasePath } = useTapisConfig();

  return useQuery<Endpoints.GetEndpointResponse, Error>(
    [QueryKeys.getEndpoint, params, accessToken],
    () => {
      if (!params) throw new Error('Endpoint request parameters are required');

      return API.Endpoints.getEndpoint(
        params,
        mlHubBasePath,
        accessToken?.access_token ?? ''
      );
    },
    {
      ...options,
      enabled: !!accessToken && !!params && options.enabled !== false,
    }
  );
};

export default useGetEndpoint;
