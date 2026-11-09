import { useMutation, MutateOptions, useQueryClient } from 'react-query';
import { Apps } from '@tapis/tapis-typescript';
import { Apps as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';
import { invalidateApp } from './appCache';
import type { ShareAppHookParams } from './useShareApp';

// Take named users off an app's share list. Removing the last user does
// NOT make the app private if it is also shared publicly — that is
// useUnShareAppPublic's job, and the panel says so.
const useUnShareApp = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Apps.RespBasic, Error, ShareAppHookParams>(
      [QueryKeys.unShareApp, basePath, jwt],
      ({ appId, users }) =>
        API.unShareApp({ appId, reqShareUpdate: { users } }, basePath, jwt),
      { onSuccess: () => invalidateApp(queryClient) }
    );

  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    unShare: (
      params: ShareAppHookParams,
      options?: MutateOptions<Apps.RespBasic, Error, ShareAppHookParams>
    ) => mutate(params, options),
  };
};

export default useUnShareApp;
