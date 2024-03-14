import { useMutation, MutateOptions } from 'react-query';
import { Pods } from '@tapis/tapis-typescript';
import { makeNewPod } from '../../tapis-api/pods';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';

type MkNewPodHookParams = {
  newPod: Pods.NewPod;
};

const useMakeNewPod = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, mkdir helper is called to perform the operation
  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Pods.PodResponse, Error, MkNewPodHookParams>(
      [QueryKeys.makeNewPod, basePath, jwt],
      ({ newPod }) => makeNewPod({ newPod }, basePath, jwt)
    );

  // Return hook object with loading states and login function
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    makeNewPod: (
      newPod: Pods.NewPod,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<Pods.PodResponse, Error, MkNewPodHookParams>
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate({ newPod }, options);
    },
  };
};

export default useMakeNewPod;
