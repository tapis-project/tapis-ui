import { useMutation, MutateOptions } from 'react-query';
import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';

type CreateTaskHookParams = Workflows.CreateTaskRequest;

const useCreate = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, create helper is called to perform the operation
  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Workflows.RespResourceURL, Error, CreateTaskHookParams>(
      [QueryKeys.create, basePath, jwt],
      (params) => API.Tasks.create(params, basePath, jwt)
    );

  // Return hook object with loading states and login function
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    create: (
      params: CreateTaskHookParams,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<
        Workflows.RespResourceURL,
        Error,
        CreateTaskHookParams
      >
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate(params, options);
    },
  };
};

export default useCreate;
