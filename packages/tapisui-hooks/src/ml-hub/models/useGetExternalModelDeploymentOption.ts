import { QueryObserverOptions, useQuery } from 'react-query';
import * as Models from '@mlhub/models-ts-sdk';
import { MLHub as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';

export type GetExternalModelDeploymentOptionParams =
  Models.GetExternalModelDeploymentOptionRequest;

const useGetExternalModelDeploymentOption = (
  params: GetExternalModelDeploymentOptionParams | undefined,
  options: QueryObserverOptions<
    Models.GetExternalModelDeploymentOptionResponse,
    Error
  > = {}
) => {
  const { accessToken, mlHubBasePath } = useTapisConfig();

  return useQuery<Models.GetExternalModelDeploymentOptionResponse, Error>(
    [QueryKeys.getExternalModelDeploymentOption, params, accessToken],
    () =>
      API.Models.getExternalModelDeploymentOption(
        params!,
        mlHubBasePath,
        accessToken?.access_token ?? ''
      ),
    {
      ...options,
      enabled:
        !!accessToken &&
        !!params?.externalModelId &&
        !!params?.deploymentOptionId &&
        options.enabled !== false,
    }
  );
};

export default useGetExternalModelDeploymentOption;
