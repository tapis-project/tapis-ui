import { useMutation, MutateOptions, useQueryClient } from 'react-query';
import { Systems } from '@tapis/tapis-typescript';
import { Systems as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';

const useUnShareSystem = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Systems.RespBasic, Error, Systems.UnShareSystemRequest>(
      [QueryKeys.unShareSystem, basePath, jwt],
      (params) => API.unShareSystem(params, basePath, jwt)
    );

  const invalidate = () => {
    // sharedWithUsers lives on the system record — every reader of it
    queryClient.invalidateQueries(QueryKeys.details);
    queryClient.invalidateQueries(QueryKeys.list);
    queryClient.invalidateQueries(QueryKeys.listWindow);
    queryClient.invalidateQueries(QueryKeys.userPermsMap);
  };

  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    invalidate,
    unShare: (
      params: Systems.UnShareSystemRequest,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<
        Systems.RespBasic,
        Error,
        Systems.UnShareSystemRequest
      >
    ) => {
      return mutate(params, options);
    },
  };
};

export default useUnShareSystem;
