import { useEffect } from 'react';
import { useMutation, MutateOptions } from 'react-query';
import { Pods } from '@tapis/tapis-typescript';
import { Pods as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';

type SetPodPermissionHookParams = Pods.SetPodPermissionRequest;

const useSetPodPermission = (podId: string) => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, mkdir helper is called to perform the operation
  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<
      Pods.PodPermissionsResponse,
      Error,
      Pods.SetPodPermissionRequest
    >([QueryKeys.setPodPermission, podId, basePath, jwt], (params) =>
      API.setPodPermission(params, basePath, jwt)
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
    setPodPermission: (
      params: SetPodPermissionHookParams,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<
        Pods.PodPermissionsResponse,
        Error,
        SetPodPermissionHookParams
      >
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate(params, options);
    },
  };
};

export default useSetPodPermission;
