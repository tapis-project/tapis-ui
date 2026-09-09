import { useMutation, MutateOptions, useQueryClient } from 'react-query';
import { Apps } from '@tapis/tapis-typescript';
import { Apps as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';
import { invalidateApp, patchCachedEnabled } from './appCache';

// Mirrors Systems.useDisableSystem. Disabling stops new launches without
// deleting anything — jobs already running are unaffected.
const useDisableApp = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Apps.RespChangeCount, Error, Apps.DisableAppRequest>(
      [QueryKeys.disableApp, basePath, jwt],
      (params) => API.disableApp(params, basePath, jwt),
      {
        onSuccess: (_data, params) => {
          queryClient.setQueriesData(QueryKeys.list, (old: unknown) =>
            patchCachedEnabled(old, params.appId, false)
          );
          invalidateApp(queryClient);
        },
      }
    );

  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    disable: (
      params: Apps.DisableAppRequest,
      options?: MutateOptions<
        Apps.RespChangeCount,
        Error,
        Apps.DisableAppRequest
      >
    ) => mutate(params, options),
  };
};

export default useDisableApp;
