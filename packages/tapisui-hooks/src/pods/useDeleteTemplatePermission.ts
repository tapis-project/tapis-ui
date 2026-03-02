import { useMutation, MutateOptions } from 'react-query';
import { Pods } from '@tapis/tapis-typescript';
import { Pods as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';

type DeleteTemplatePermissionHookParams = Pods.DeleteTemplatePermissionRequest;

const useDeleteTemplatePermission = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

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
    Pods.TemplatePermissionsResponse,
    Error,
    DeleteTemplatePermissionHookParams
  >([QueryKeys.deleteTemplatePermission, basePath, jwt], (params) =>
    API.deleteTemplatePermission(params, basePath, jwt)
  );

  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    deleteTemplatePermission: (
      params: DeleteTemplatePermissionHookParams,
      options?: MutateOptions<
        Pods.TemplatePermissionsResponse,
        Error,
        DeleteTemplatePermissionHookParams
      >
    ) => mutate(params, options),
    removeAsync: (
      params: DeleteTemplatePermissionHookParams,
      options?: MutateOptions<
        Pods.TemplatePermissionsResponse,
        Error,
        DeleteTemplatePermissionHookParams
      >
    ) => mutateAsync(params, options),
  };
};

export default useDeleteTemplatePermission;
