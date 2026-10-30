import { MutateOptions, useMutation, useQueryClient } from 'react-query';
import * as Deployments from '@mlhub/deployments-ts-sdk';
import { MLHub as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';

const useUndeployModelDeployment = () => {
  const { mlHubBasePath, accessToken } = useTapisConfig();
  const queryClient = useQueryClient();
  const jwt = accessToken?.access_token || '';
  const mutation = useMutation<
    Deployments.ModelDeploymentResponse,
    Error,
    Deployments.UndeployModelDeploymentRequest
  >(
    [QueryKeys.undeployModelDeployment, mlHubBasePath, jwt],
    (params) =>
      API.Deployments.undeployModelDeployment(params, mlHubBasePath, jwt),
    {
      onSuccess: () => queryClient.invalidateQueries(QueryKeys.listDeployments),
    }
  );

  return {
    ...mutation,
    undeploy: (
      params: Deployments.UndeployModelDeploymentRequest,
      options?: MutateOptions<
        Deployments.ModelDeploymentResponse,
        Error,
        Deployments.UndeployModelDeploymentRequest
      >
    ) => mutation.mutate(params, options),
  };
};

export default useUndeployModelDeployment;
