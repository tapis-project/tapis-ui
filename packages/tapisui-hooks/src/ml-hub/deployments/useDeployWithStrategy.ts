import { useMutation, MutateOptions } from 'react-query';
import * as Deployments from '@mlhub/deployments-ts-sdk';
import { MLHub as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';

const useDeployWithStrategy = () => {
  const { mlHubBasePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<
      Deployments.ModelDeploymentResponse,
      Error,
      Deployments.DeployModelWithStrategyRequest
    >(
      [QueryKeys.deployWithStrategy, mlHubBasePath, jwt],
      (params: Deployments.DeployModelWithStrategyRequest) =>
        API.Deployments.deployModelWithStrategy(params, mlHubBasePath, jwt)
    );

  // Return hook object with loading states and login function
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    deploy: (
      params: Deployments.DeployModelWithStrategyRequest,
      options?: MutateOptions<
        Deployments.ModelDeploymentResponse,
        Error,
        Deployments.DeployModelWithStrategyRequest
      >
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate(params, options);
    },
  };
};

export default useDeployWithStrategy;
