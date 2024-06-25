import { useMutation, MutateOptions } from 'react-query';
import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';

type RemoveGroupUserHookParams = {
  groupId: string;
  username: string;
};

const useDelete = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, move helper is called to perform the operation
  const {
    mutate,
    mutateAsync,
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
  } = useMutation<Workflows.RespGroupUser, Error, RemoveGroupUserHookParams>(
    [QueryKeys.remove, basePath, jwt],
    (params) => API.GroupUsers.remove(params, basePath, jwt)
  );

  // Return hook object with loading states and login function
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    remove: (
      params: RemoveGroupUserHookParams,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<
        Workflows.RespGroupUser,
        Error,
        RemoveGroupUserHookParams
      >
    ) => mutate(params, options),
    removeAsync: (
      params: RemoveGroupUserHookParams,
      options?: MutateOptions<
        Workflows.RespGroupUser,
        Error,
        RemoveGroupUserHookParams
      >
    ) => mutateAsync(params, options),
  };
};

export default useDelete;
