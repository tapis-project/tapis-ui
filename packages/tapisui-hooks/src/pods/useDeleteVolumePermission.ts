import { useMutation, MutateOptions } from 'react-query';
import { Pods } from '@tapis/tapis-typescript';
import { Pods as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';

type DeleteVolumePermissionHookParams = Pods.DeleteVolumePermissionRequest;

const useDeleteVolumePermission = () => {
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
  } = useMutation<
    Pods.VolumePermissionsResponse,
    Error,
    DeleteVolumePermissionHookParams
  >([QueryKeys.deleteVolumePermission, basePath, jwt], (params) =>
    API.deleteVolumePermission(params, basePath, jwt)
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
      params: DeleteVolumePermissionHookParams,
      // MutateOptions is a type that allows us to specify things like onSuccess
      options?: MutateOptions<
        Pods.VolumePermissionsResponse,
        Error,
        DeleteVolumePermissionHookParams
      >
    ) => mutate(params, options),
    removeAsync: (
      params: DeleteVolumePermissionHookParams,
      options?: MutateOptions<
        Pods.VolumePermissionsResponse,
        Error,
        DeleteVolumePermissionHookParams
      >
    ) => mutateAsync(params, options),
  };
};

export default useDeleteVolumePermission;
