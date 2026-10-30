import { MutateOptions, useMutation, useQueryClient } from 'react-query';
import * as Deployments from '@mlhub/deployments-ts-sdk';
import { MLHub as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';

const useDeployWithOption = () => {
  const { mlHubBasePath, accessToken } = useTapisConfig();
  const queryClient = useQueryClient();
  const jwt = accessToken?.access_token || '';
  const mutation = useMutation<
    Deployments.ModelDeploymentResponse,
    Error,
    Deployments.DeployModelWithOptionRequest
  >(
    [QueryKeys.deployWithOption, mlHubBasePath, jwt],
    (params) =>
      API.Deployments.deployModelWithOption(params, mlHubBasePath, jwt),
    {
      onSuccess: () => queryClient.invalidateQueries(QueryKeys.listDeployments),
    }
  );

  return {
    ...mutation,
    deploy: (
      params: Deployments.DeployModelWithOptionRequest,
      options?: MutateOptions<
        Deployments.ModelDeploymentResponse,
        Error,
        Deployments.DeployModelWithOptionRequest
      >
    ) => mutation.mutate(params, options),
  };
};

export default useDeployWithOption;
