import { useMutation, MutateOptions } from 'react-query';
import { Pods } from '@tapis/tapis-typescript';
import { Pods as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';

type StartPodHookParams = Pods.StartPodRequest;

const useStartPod = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, mkdir helper is called to perform the operation
  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Pods.PodResponse, Error, StartPodHookParams>(
      [QueryKeys.startPod, basePath, jwt],
      (params) => API.startPod(params, basePath, jwt)
    );

  // Return hook object with loading states and login function
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    startPod: (
      params: StartPodHookParams,
      // MutateOptions is a type that allows us to specify things like onSuccess
      options?: MutateOptions<Pods.PodResponse, Error, StartPodHookParams>
    ) => mutate(params, options),
  };
};

export default useStartPod;
