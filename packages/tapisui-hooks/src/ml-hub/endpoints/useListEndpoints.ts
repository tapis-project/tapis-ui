import { QueryObserverOptions, useQuery } from 'react-query';
import * as Endpoints from '@mlhub/endpoints-ts-sdk';
import { MLHub as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../..';
import QueryKeys from './queryKeys';

export type ListEndpointsParams = Parameters<
  Endpoints.EndpointsApi['listEndpoints']
>[0];

const useListEndpoints = (
  params: ListEndpointsParams = {},
  options: QueryObserverOptions<Endpoints.ListEndpointsResponse, Error> = {}
) => {
  const { accessToken, mlHubBasePath } = useTapisConfig();

  return useQuery<Endpoints.ListEndpointsResponse, Error>(
    [QueryKeys.listEndpoints, params, accessToken],
    () =>
      API.Endpoints.listEndpoints(
        params,
        mlHubBasePath,
        accessToken?.access_token ?? ''
      ),
    {
      ...options,
      enabled: !!accessToken && options.enabled !== false,
    }
  );
};

export default useListEndpoints;
