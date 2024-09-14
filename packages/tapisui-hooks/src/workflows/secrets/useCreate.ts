import { useMutation, MutateOptions, useQueryClient } from 'react-query';
import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';

type CreateSecretHookParams = {
  id: string;
  description?: string;
  data: any;
};

const useCreate = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Workflows.RespSecret, Error, CreateSecretHookParams>(
      [QueryKeys.create, basePath, jwt],
      (params) => API.Secrets.create({ reqCreateSecret: params }, basePath, jwt)
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
      params: CreateSecretHookParams,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<
        Workflows.RespSecret,
        Error,
        CreateSecretHookParams
      >
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate(params, options);
    },
  };
};

export default useCreate;
