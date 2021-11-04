import { CopyMoveHookParams } from '.';
import { useMutation, MutateOptions } from 'react-query';
import { Files } from '@tapis/tapis-typescript';
import { moveCopy } from 'tapis-api/files';
import { useTapisConfig } from 'tapis-hooks';
import QueryKeys from './queryKeys';

const useCopy = () => {
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
  } = useMutation<Files.FileStringResponse, Error, CopyMoveHookParams>(
    [QueryKeys.move, basePath, jwt],
    ({ systemId, path, newPath }) =>
      moveCopy(
        systemId,
        path,
        newPath,
        Files.MoveCopyRequestOperationEnum.Copy,
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
    copy: (
      params: CopyMoveHookParams,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<
        Files.FileStringResponse,
        Error,
        CopyMoveHookParams
      >
    ) => mutate(params, options),
    copyAsync: (
      params: CopyMoveHookParams,
      options?: MutateOptions<
        Files.FileStringResponse,
        Error,
        CopyMoveHookParams
      >
    ) => mutateAsync(params, options),
  };
};

export default useCopy;
