import { useEffect } from 'react';
import { useMutation, useInfiniteQuery } from 'react-query';
import { Files } from '@tapis/tapis-typescript';
import { mkdir } from 'tapis-api/files';
import { useTapisConfig } from 'tapis-hooks';
import QueryKeys from './queryKeys';

type MkdirHookParams = {
  systemId: string;
  path: string;
}

const useMkdir = ( onSuccess: () => any ) => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  useInfiniteQuery({onSuccess});

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, mkdir helper is called to perform the operation
  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Files.FileStringResponse, Error, MkdirHookParams>(
      [QueryKeys.mkdir, basePath, jwt],
      ({systemId, path}) => mkdir(systemId, path, basePath, jwt)
    );

  useEffect(() => reset(), [reset]);

  // Return hook object with loading states and login function
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    mkdir: (systemId: string, path: string) => {
      // Call mutate to trigger a single post-like API operation
      return mutate({systemId, path}, { onSuccess });
    },
  };
};

export default useMkdir;
