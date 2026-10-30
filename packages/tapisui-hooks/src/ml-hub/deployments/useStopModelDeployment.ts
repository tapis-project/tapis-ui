import { MutateOptions, useMutation, useQueryClient } from 'react-query';
import * as Deployments from '@mlhub/deployments-ts-sdk';
import { MLHub as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';

const useStopModelDeployment = () => {
  const { mlHubBasePath, accessToken } = useTapisConfig();
  const queryClient = useQueryClient();
  const jwt = accessToken?.access_token || '';
  const mutation = useMutation<
    Deployments.ModelDeploymentResponse,
    Error,
    Deployments.StopModelDeploymentRequest
  >(
    [QueryKeys.stopModelDeployment, mlHubBasePath, jwt],
    (params) => API.Deployments.stopModelDeployment(params, mlHubBasePath, jwt),
    {
      onSuccess: () => queryClient.invalidateQueries(QueryKeys.listDeployments),
    }
  );

  return {
    ...mutation,
    stop: (
      params: Deployments.StopModelDeploymentRequest,
      options?: MutateOptions<
        Deployments.ModelDeploymentResponse,
        Error,
        Deployments.StopModelDeploymentRequest
      >
    ) => mutation.mutate(params, options),
  };
};

export default useStopModelDeployment;
