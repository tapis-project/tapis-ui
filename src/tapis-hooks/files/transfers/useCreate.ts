import { useMutation, MutateOptions } from 'react-query';
import { Files } from '@tapis/tapis-typescript';
import { create } from 'tapis-api/files/transfers';
import { useTapisConfig } from 'tapis-hooks';
import QueryKeys from './queryKeys';

type TransferTaskParams = Array<Files.TransferTaskRequestElement>;

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
  } = useMutation<Files.TransferTaskResponse, Error, TransferTaskParams>(
    [QueryKeys.create, basePath, jwt],
    (elements) =>
      create(
        elements,
        basePath,
        jwt
      )
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
      elements: TransferTaskParams,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<
        Files.TransferTaskResponse,
        Error,
        TransferTaskParams
      >
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate(elements, options);
    },
    moveAsync: (
      elements: TransferTaskParams,
      options?: MutateOptions<
        Files.TransferTaskResponse,
        Error,
        TransferTaskParams
      >
    ) => mutateAsync(elements, options),
  };
};

export default useCreate;
