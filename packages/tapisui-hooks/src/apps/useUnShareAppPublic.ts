import { useMutation, MutateOptions, useQueryClient } from 'react-query';
import { Apps } from '@tapis/tapis-typescript';
import { Apps as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';
import { invalidateApp } from './appCache';

type UnShareAppPublicHookParams = {
  appId: string;
};

// Withdraw tenant-wide access. Users the app was shared with by name
// keep theirs — the two doors are independent.
const useUnShareAppPublic = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Apps.RespBasic, Error, UnShareAppPublicHookParams>(
      [QueryKeys.unShareAppPublic, basePath, jwt],
      ({ appId }) => API.unShareAppPublic(appId, basePath, jwt),
      { onSuccess: () => invalidateApp(queryClient) }
    );

  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    unShareAppPublic: (
      appId: string,
      options?: MutateOptions<Apps.RespBasic, Error, UnShareAppPublicHookParams>
    ) => mutate({ appId }, options),
  };
};

export default useUnShareAppPublic;
