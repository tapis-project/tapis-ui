import { useState, useCallback } from 'react';
import { useMutation, MutateOptions } from 'react-query';
import { Files } from '@tapis/tapis-typescript';
import { insertAxios as insert } from 'tapis-api/files';
import { useTapisConfig } from 'tapis-hooks';
import QueryKeys from './queryKeys';

export type InsertHookParams = {
  systemId: string;
  path: string;
  file: File;
};

const useUpload = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  const [progress, setProgress] = useState<number>(0)
  const [uploadingFile, setUploadingFile] = useState<File | undefined>(undefined)

  const getProgress = useCallback(() => {
    return {
      file: uploadingFile,
      progress
    }
  }, [progress])

  const progressCallback = (uploadProgress: number, file: File) => {
    setUploadingFile(file)
    setProgress(uploadProgress)
  }

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
    ({ systemId, path, file }) => insert(systemId, path, file, basePath, jwt, progressCallback)
  );

  // Return hook object with loading states and login function
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    getProgress,
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
