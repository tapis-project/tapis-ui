import { useMutation, MutateOptions, useQueryClient } from 'react-query';
import { Apps } from '@tapis/tapis-typescript';
import { Apps as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';
import { invalidateApp } from './appCache';

const useUndeleteApp = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Apps.RespChangeCount, Error, Apps.UndeleteAppRequest>(
      [QueryKeys.undeleteApp, basePath, jwt],
      (params) => API.undeleteApp(params, basePath, jwt),
      { onSuccess: () => invalidateApp(queryClient) }
    );

  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    undelete: (
      params: Apps.UndeleteAppRequest,
      options?: MutateOptions<
        Apps.RespChangeCount,
        Error,
        Apps.UndeleteAppRequest
      >
    ) => mutate(params, options),
  };
};

export default useUndeleteApp;
