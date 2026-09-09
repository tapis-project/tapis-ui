import { useMutation, MutateOptions, useQueryClient } from 'react-query';
import { Apps } from '@tapis/tapis-typescript';
import { Apps as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';
import { invalidateApp, patchCachedEnabled } from './appCache';

// Mirrors Systems.useEnableSystem. A disabled app cannot be launched;
// this is the door back.
const useEnableApp = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Apps.RespChangeCount, Error, Apps.EnableAppRequest>(
      [QueryKeys.enableApp, basePath, jwt],
      (params) => API.enableApp(params, basePath, jwt),
      {
        // the response is a count, so patch the cached app NOW and let
        // the refetch confirm — otherwise the chip lies until it lands
        onSuccess: (_data, params) => {
          queryClient.setQueriesData(QueryKeys.list, (old: unknown) =>
            patchCachedEnabled(old, params.appId, true)
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
    enable: (
      params: Apps.EnableAppRequest,
      options?: MutateOptions<
        Apps.RespChangeCount,
        Error,
        Apps.EnableAppRequest
      >
    ) => mutate(params, options),
  };
};

export default useEnableApp;
