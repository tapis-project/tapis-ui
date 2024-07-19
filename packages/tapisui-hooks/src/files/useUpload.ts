import { useMutation, MutateOptions } from 'react-query';
import { Files } from '@tapis/tapis-typescript';
import { Files as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';

export type InsertHookParams = {
  systemId: string;
  path: string;
  file: File;
  progressCallback?: (progress: number, file: File) => void;
};

const useUpload = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, upload helper is called to perform the operation
  const {
    mutate,
    mutateAsync,
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
  } = useMutation<Files.FileStringResponse, Error, InsertHookParams>(
    [QueryKeys.insertAxios, basePath, jwt],
    ({ systemId, path, file, progressCallback }) =>
      API.insertAxios(systemId, path, file, basePath, jwt, progressCallback)
  );

  // Return hook object with loading states and login function
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    uploadFile: (
      params: InsertHookParams,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<Files.FileStringResponse, Error, InsertHookParams>
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate(params, options);
    },
    uploadAsync: (
      params: InsertHookParams,
      options?: MutateOptions<Files.FileStringResponse, Error, InsertHookParams>
    ) => mutateAsync(params, options),
  };
};

export default useUpload;
