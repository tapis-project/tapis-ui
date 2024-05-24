import { useMutation, MutateOptions } from 'react-query';
import { Files } from '@tapis/tapis-typescript';
import { Files as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../';
import { NativeOpParams } from '.';
import QueryKeys from './queryKeys';

const useNativeOp = () => {
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
  } = useMutation<Files.NativeLinuxOpResultResponse, Error, NativeOpParams>(
    [QueryKeys.nativeOp, basePath, jwt],
    ({ systemId, path, recursive, operation, argument }) =>
      API.nativeOp(
        systemId,
        path,
        recursive ? true : false,
        operation,
        argument ?? '',
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
    nativeOp: (
      params: NativeOpParams,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<
        Files.NativeLinuxOpResultResponse,
        Error,
        NativeOpParams
      >
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate(params, options);
    },
    nativeOpAsync: (
      params: NativeOpParams,
      options?: MutateOptions<
        Files.NativeLinuxOpResultResponse,
        Error,
        NativeOpParams
      >
    ) => mutateAsync(params, options),
  };
};

export default useNativeOp;
