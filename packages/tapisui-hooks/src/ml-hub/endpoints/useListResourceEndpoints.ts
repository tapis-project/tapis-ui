import { QueryObserverOptions, useQuery } from 'react-query';
import * as Endpoints from '@mlhub/endpoints-ts-sdk';
import { MLHub as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../..';
import QueryKeys from './queryKeys';

export type ListResourceEndpointsParams = Parameters<
  Endpoints.EndpointsApi['listResourceEndpoints']
>[0];

const useListResourceEndpoints = (
  params: ListResourceEndpointsParams | undefined,
  options: QueryObserverOptions<Endpoints.ListEndpointsResponse, Error> = {}
) => {
  const { accessToken, mlHubBasePath } = useTapisConfig();

  return useQuery<Endpoints.ListEndpointsResponse, Error>(
    [QueryKeys.listResourceEndpoints, params, accessToken],
    () => {
      if (!params) {
        throw new Error('Resource endpoint request parameters are required');
      }

      return API.Endpoints.listResourceEndpoints(
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

export default useListResourceEndpoints;
