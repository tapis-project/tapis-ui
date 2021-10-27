import { useMutation, MutateOptions } from 'react-query';
import { Files } from '@tapis/tapis-typescript';
import { moveCopy } from 'tapis-api/files';
import { useTapisConfig } from 'tapis-hooks';
import QueryKeys from './queryKeys';

type MoveHookParams = {
  systemId: string;
  path: string;
  newPath: string;
};

const useMove = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, move helper is called to perform the operation
  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Files.FileStringResponse, Error, MoveHookParams>(
      [QueryKeys.move, basePath, jwt],
      ({ systemId, path, newPath }) =>
        moveCopy(
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
      systemId: string,
      path: string,
      newPath: string,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<Files.FileStringResponse, Error, MoveHookParams>
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate({ systemId, path, newPath }, options);
    },
  };
};

export default useMove;
