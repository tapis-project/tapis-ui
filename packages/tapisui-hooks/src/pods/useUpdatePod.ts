import { useEffect } from 'react';
import { useMutation, MutateOptions } from 'react-query';
import { Pods } from '@tapis/tapis-typescript';
import { Pods as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';

type UpdatePodHookParams = Pods.UpdatePodRequest;

const useUpdatePod = (podId: string) => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, mkdir helper is called to perform the operation
  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Pods.PodResponse, Error, Pods.UpdatePodRequest>(
      [QueryKeys.updatePod, podId, basePath, jwt],
      (params) => API.updatePod(params, basePath, jwt)
    );

  useEffect(() => reset(), [reset, podId]);

  // Return hook object with loading states and login function
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    updatePod: (
      params: UpdatePodHookParams,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<Pods.PodResponse, Error, UpdatePodHookParams>
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate(params, options);
    },
  };
};

export default useUpdatePod;
