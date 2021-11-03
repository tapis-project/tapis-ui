import { useMutation, MutateOptions } from 'react-query';
import { Files } from '@tapis/tapis-typescript';
import { insert } from 'tapis-api/files';
import { useTapisConfig } from 'tapis-hooks';
import QueryKeys from './queryKeys';

type InsertParams = {
  systemId: string;
  path: string;
  file: Blob;
};

const useUpload = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, move helper is called to perform the operation
  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Files.FileStringResponse, Error, InsertParams>(
      [QueryKeys.insert, basePath, jwt],
      ({ systemId, path, file }) =>
        insert(
          systemId,
          path,
          file,
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
    insert: (
      systemId: string,
      path: string,
      file: Blob,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<Files.FileStringResponse, Error, InsertParams>
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate({ systemId, path, file }, options);
    },
  };
};

export default useUpload;
