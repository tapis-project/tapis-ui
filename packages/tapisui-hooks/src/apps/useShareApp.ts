import { useMutation, MutateOptions, useQueryClient } from 'react-query';
import { Apps } from '@tapis/tapis-typescript';
import { Apps as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';
import { invalidateApp } from './appCache';

export type ShareAppHookParams = {
  appId: string;
  users: Array<string>;
};

// Share an app with named users — they can see it and launch jobs with
// it. Public sharing is the separate, tenant-wide door.
const useShareApp = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Apps.RespBasic, Error, ShareAppHookParams>(
      [QueryKeys.shareApp, basePath, jwt],
      ({ appId, users }) =>
        API.shareApp({ appId, reqShareUpdate: { users } }, basePath, jwt),
      { onSuccess: () => invalidateApp(queryClient) }
    );

  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    share: (
      params: ShareAppHookParams,
      options?: MutateOptions<Apps.RespBasic, Error, ShareAppHookParams>
    ) => mutate(params, options),
  };
};

export default useShareApp;
