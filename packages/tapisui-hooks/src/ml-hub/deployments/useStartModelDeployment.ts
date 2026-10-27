import { MutateOptions, useMutation, useQueryClient } from 'react-query';
import * as Deployments from '@mlhub/deployments-ts-sdk';
import { MLHub as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';

const useStartModelDeployment = () => {
  const { mlHubBasePath, accessToken } = useTapisConfig();
  const queryClient = useQueryClient();
  const jwt = accessToken?.access_token || '';
  const mutation = useMutation<
    Deployments.ModelDeploymentResponse,
    Error,
    Deployments.StartModelDeploymentRequest
  >(
    [QueryKeys.startModelDeployment, mlHubBasePath, jwt],
    (params) =>
      API.Deployments.startModelDeployment(params, mlHubBasePath, jwt),
    {
      onSuccess: () => queryClient.invalidateQueries(QueryKeys.listDeployments),
    }
  );

  return {
    ...mutation,
    start: (
      params: Deployments.StartModelDeploymentRequest,
      options?: MutateOptions<
        Deployments.ModelDeploymentResponse,
        Error,
        Deployments.StartModelDeploymentRequest
      >
    ) => mutation.mutate(params, options),
  };
};

export default useStartModelDeployment;
