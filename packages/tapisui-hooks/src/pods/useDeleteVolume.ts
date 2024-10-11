import { useMutation, MutateOptions } from 'react-query';
import { Pods } from '@tapis/tapis-typescript';
import { Pods as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';

type DeleteVolumeHookParams = Pods.DeleteVolumeRequest;

const useDeleteVolume = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, mkdir helper is called to perform the operation
  const {
    mutate,
    mutateAsync,
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
  } = useMutation<Pods.DeleteVolumeResponse, Error, DeleteVolumeHookParams>(
    [QueryKeys.deleteVolume, basePath, jwt],
    (params) => API.deleteVolume(params, basePath, jwt)
  );

  // Return hook object with loading states and login function
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    deleteVolume: (
      params: DeleteVolumeHookParams,
      // MutateOptions is a type that allows us to specify things like onSuccess
      options?: MutateOptions<
        Pods.DeleteVolumeResponse,
        Error,
        DeleteVolumeHookParams
      >
    ) => mutate(params, options),
    removeAsync: (
      params: DeleteVolumeHookParams,
      options?: MutateOptions<
        Pods.DeleteVolumeResponse,
        Error,
        DeleteVolumeHookParams
      >
    ) => mutateAsync(params, options),
  };
};

export default useDeleteVolume;
