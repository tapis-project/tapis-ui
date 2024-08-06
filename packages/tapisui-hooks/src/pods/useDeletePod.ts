import { useMutation, MutateOptions } from 'react-query';
import { Pods } from '@tapis/tapis-typescript';
import { Pods as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';

type DeletePodHookParams = {
  podId: string;
};

const useDeletePod = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, mkdir helper is called to perform the operation
  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Pods.PodDeleteResponse, Error, DeletePodHookParams>(
      [QueryKeys.deletePod, basePath, jwt],
      ({ podId }) => API.deletePod(podId, basePath, jwt)
    );

  // Return hook object with loading states and login function
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    deletePod: (
      podId: string,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<
        Pods.PodDeleteResponse,
        Error,
        DeletePodHookParams
      >
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate({ podId }, options);
    },
  };
};

export default useDeletePod;
