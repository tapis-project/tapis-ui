import { useMutation, MutateOptions, useQueryClient } from 'react-query';
import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';

type DeleteGroupSecretHookParams = {
  groupId: string;
  groupSecretId: string;
};

const useDelete = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Workflows.RespBase, Error, DeleteGroupSecretHookParams>(
      [QueryKeys.remove, basePath, jwt],
      (params) => API.GroupSecrets.remove(params, basePath, jwt)
    );

  const invalidate = () => {
    queryClient.invalidateQueries(QueryKeys.list);
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
    remove: (
      params: DeleteGroupSecretHookParams,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<
        Workflows.RespBase,
        Error,
        DeleteGroupSecretHookParams
      >
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate(params, options);
    },
  };
};

export default useDelete;
