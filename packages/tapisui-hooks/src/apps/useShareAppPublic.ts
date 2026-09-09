import { useMutation, MutateOptions, useQueryClient } from 'react-query';
import { Apps } from '@tapis/tapis-typescript';
import { Apps as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';
import { invalidateApp } from './appCache';

type ShareAppPublicHookParams = {
  appId: string;
};

// Mirrors Systems.useShareSystemPublic — grant public access to an app so
// every tenant user can run jobs against it.
const useShareAppPublic = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Apps.RespBasic, Error, ShareAppPublicHookParams>(
      [QueryKeys.shareAppPublic, basePath, jwt],
      ({ appId }) => API.shareAppPublic(appId, basePath, jwt),
      // it used to invalidate nothing at all: the app went public and the
      // page kept saying private until something else refetched
      { onSuccess: () => invalidateApp(queryClient) }
    );

  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    shareAppPublic: (
      appId: string,
      options?: MutateOptions<Apps.RespBasic, Error, ShareAppPublicHookParams>
    ) => mutate({ appId }, options),
  };
};

export default useShareAppPublic;
