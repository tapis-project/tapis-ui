import { useMutation, MutateOptions, useQueryClient } from 'react-query';
import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';

type AddGroupSecretHookParams = {
  groupId: string;
  reqGroupSecret: Workflows.ReqGroupSecret;
};

const useCreate = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Workflows.RespGroupSecret, Error, AddGroupSecretHookParams>(
      [QueryKeys.create, basePath, jwt],
      (params) => API.GroupSecrets.create(params, basePath, jwt)
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
    create: (
      params: AddGroupSecretHookParams,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<
        Workflows.RespGroupSecret,
        Error,
        AddGroupSecretHookParams
      >
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate(params, options);
    },
  };
};

export default useCreate;
