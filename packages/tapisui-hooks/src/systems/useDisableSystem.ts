import { useMutation, MutateOptions, useQueryClient } from 'react-query';
import { Systems } from '@tapis/tapis-typescript';
import { Systems as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';

const useDisableSystem = (params: Systems.DisableSystemRequest) => {
  const { accessToken, basePath } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Systems.RespChangeCount, Error, Systems.DisableSystemRequest>(
      [QueryKeys.disableSystem, basePath, jwt],
      (params) => API.disableSystem(params, basePath, jwt),
      {
        // The response is only a count, so patch the cached record NOW —
        // the card flips, the detail layout's spine write-through flips
        // the nav row and landing with it — then let the refetches confirm.
        onSuccess: (_data, params) => {
          queryClient.setQueriesData(QueryKeys.details, (old: any) =>
            old?.result?.id === params.systemId
              ? { ...old, result: { ...old.result, enabled: false } }
              : old
          );
          queryClient.invalidateQueries(QueryKeys.details);
          queryClient.invalidateQueries(QueryKeys.list);
          queryClient.invalidateQueries(QueryKeys.listWindow);
        },
      }
    );

  const invalidate = () => {
    queryClient.invalidateQueries(QueryKeys.details);
  };

  // Return hook object with loading states and login function
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    invalidate,
    disable: (
      params: Systems.DisableSystemRequest,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<
        Systems.RespChangeCount,
        Error,
        Systems.DisableSystemRequest
      >
    ) => {
      return mutate(params, options);
    },
  };
};

export default useDisableSystem;
