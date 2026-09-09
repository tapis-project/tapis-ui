import { useMutation, MutateOptions, useQueryClient } from 'react-query';
import { Apps } from '@tapis/tapis-typescript';
import { Apps as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';
import { invalidateApp } from './appCache';

const useDeleteApp = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Apps.RespChangeCount, Error, Apps.DeleteAppRequest>(
      [QueryKeys.deleteApp, basePath, jwt],
      (params) => API.deleteApp(params, basePath, jwt),
      { onSuccess: () => invalidateApp(queryClient) }
    );

  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    remove: (
      params: Apps.DeleteAppRequest,
      options?: MutateOptions<
        Apps.RespChangeCount,
        Error,
        Apps.DeleteAppRequest
      >
    ) => mutate(params, options),
  };
};

export default useDeleteApp;
