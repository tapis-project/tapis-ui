import { useMutation, MutateOptions } from 'react-query';
import { Files } from '@tapis/tapis-typescript';
import { Files as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';

const useCreate = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, move helper is called to perform the operation
  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<
      Files.PostItResponse,
      Error,
      Files.CreatePostItOperationRequest
    >([QueryKeys.create, basePath, jwt], (request) =>
      API.PostIts.create(request, basePath, jwt)
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
      request: Files.CreatePostItOperationRequest,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<
        Files.PostItResponse,
        Error,
        Files.CreatePostItOperationRequest
      >
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate(request, options);
    },
  };
};

export default useCreate;
