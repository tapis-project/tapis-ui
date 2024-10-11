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
  const {
    mutate,
    mutateAsync,
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
  } = useMutation<
    Files.TransferTaskResponse,
    Error,
    Files.CreateTransferTaskRequest
  >([QueryKeys.create, basePath, jwt], (request) =>
    API.Transfers.create(request, basePath, jwt)
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
      request: Files.CreateTransferTaskRequest,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<
        Files.TransferTaskResponse,
        Error,
        Files.CreateTransferTaskRequest
      >
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate(request, options);
    },
    moveAsync: (
      request: Files.CreateTransferTaskRequest,
      options?: MutateOptions<
        Files.TransferTaskResponse,
        Error,
        Files.CreateTransferTaskRequest
      >
    ) => mutateAsync(request, options),
  };
};

export default useCreate;
