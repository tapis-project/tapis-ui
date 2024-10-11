import { useEffect } from 'react';
import { useMutation, MutateOptions } from 'react-query';
import { Pods } from '@tapis/tapis-typescript';
import { Pods as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';
import { setVolumePermission } from '@tapis/tapisui-api/dist/pods';

type SetVolumePermissionHookParams = Pods.SetVolumePermissionRequest;

const useSetVolumePermission = (volumeId: string) => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, mkdir helper is called to perform the operation
  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<
      Pods.VolumePermissionsResponse,
      Error,
      Pods.SetVolumePermissionRequest
    >([QueryKeys.setVolumePermission, volumeId, basePath, jwt], (params) =>
      API.setVolumePermission(params, basePath, jwt)
    );

  useEffect(() => reset(), [reset, volumeId]);

  // Return hook object with loading states and login function
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    setVolumePermission: (
      params: SetVolumePermissionHookParams,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<
        Pods.VolumePermissionsResponse,
        Error,
        SetVolumePermissionHookParams
      >
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate(params, options);
    },
  };
};

export default useSetVolumePermission;
