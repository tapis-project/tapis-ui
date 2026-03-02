import { useEffect } from 'react';
import { useMutation, MutateOptions } from 'react-query';
import { Pods } from '@tapis/tapis-typescript';
import { Pods as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';

type SetTemplatePermissionHookParams = Pods.SetTemplatePermissionRequest;

const useSetTemplatePermission = (templateId: string) => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<
      Pods.TemplatePermissionsResponse,
      Error,
      Pods.SetTemplatePermissionRequest
    >([QueryKeys.setTemplatePermission, templateId, basePath, jwt], (params) =>
      API.setTemplatePermission(params, basePath, jwt)
    );

  useEffect(() => reset(), [reset, templateId]);

  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    setTemplatePermission: (
      params: SetTemplatePermissionHookParams,
      options?: MutateOptions<
        Pods.TemplatePermissionsResponse,
        Error,
        SetTemplatePermissionHookParams
      >
    ) => {
      return mutate(params, options);
    },
  };
};

export default useSetTemplatePermission;
