import { MoveCopyHookParams } from '.';
import { useMutation, MutateOptions } from 'react-query';
import { Files } from '@tapis/tapis-typescript';
import { Files as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';

const useMove = () => {
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
  } = useMutation<Files.FileStringResponse, Error, MoveCopyHookParams>(
    [QueryKeys.move, basePath, jwt],
    ({ systemId, path, newPath }) =>
      API.moveCopy(
        systemId,
        path,
        newPath,
        Files.MoveCopyRequestOperationEnum.Move,
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
    move: (
      params: MoveCopyHookParams,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<
        Files.FileStringResponse,
        Error,
        MoveCopyHookParams
      >
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate(params, options);
    },
    moveAsync: (
      params: MoveCopyHookParams,
      options?: MutateOptions<
        Files.FileStringResponse,
        Error,
        MoveCopyHookParams
      >
    ) => mutateAsync(params, options),
  };
};

export default useMove;
