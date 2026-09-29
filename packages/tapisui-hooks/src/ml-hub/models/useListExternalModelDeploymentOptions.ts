import { QueryObserverOptions, useQuery } from 'react-query';
import * as Models from '@mlhub/models-ts-sdk';
import { MLHub as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';

export type ListExternalModelDeploymentOptionsParams =
  Models.ListExternalModelDeploymentOptionsRequest;

const useListExternalModelDeploymentOptions = (
  params: ListExternalModelDeploymentOptionsParams | undefined,
  options: QueryObserverOptions<
    Models.ListExternalModelDeploymentOptionsResponse,
    Error
  > = {}
) => {
  const { accessToken, mlHubBasePath } = useTapisConfig();

  return useQuery<Models.ListExternalModelDeploymentOptionsResponse, Error>(
    [QueryKeys.listExternalModelDeploymentOptions, params, accessToken],
    () =>
      API.Models.listExternalModelDeploymentOptions(
        params!,
        mlHubBasePath,
        accessToken?.access_token ?? ''
      ),
    {
      ...options,
      enabled:
        !!accessToken && !!params?.externalModelId && options.enabled !== false,
    }
  );
};

export default useListExternalModelDeploymentOptions;
