import { useEffect } from 'react';
import { useMutation } from 'react-query';
import { Files } from '@tapis/tapis-typescript';
import { mkdir } from 'tapis-api/files';
import { useTapisConfig } from 'tapis-hooks';
import QueryKeys from './queryKeys';

const useMkdir = (systemId: string, path: string) => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, mkdir helper is called to perform the operation
  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Files.FileStringResponse, Error, Files.MkdirOperationRequest>(
      [QueryKeys.mkdir, systemId, path, basePath, jwt],
      (request: Files.MkdirOperationRequest) => mkdir(request, basePath, jwt)
    );

  // We want this hook to automatically reset if a different appId or appVersion
  // is passed to it. This eliminates the need to reset it inside the TSX component
  useEffect(() => reset(), [reset, systemId, path]);

  // Return hook object with loading states and login function
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    mkdir: (request: Files.MkdirOperationRequest) => {
      // Call mutate to trigger a single post-like API operation
      return mutate(request);
    },
  };
};

export default useMkdir;
