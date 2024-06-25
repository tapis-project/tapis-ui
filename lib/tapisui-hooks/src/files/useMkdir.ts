import { useMutation, MutateOptions } from 'react-query';
import { Files } from '@tapis/tapis-typescript';
import { Files as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';

type MkdirHookParams = {
  systemId: string;
  path: string;
};

const useMkdir = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, mkdir helper is called to perform the operation
  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Files.FileStringResponse, Error, MkdirHookParams>(
      [QueryKeys.mkdir, basePath, jwt],
      ({ systemId, path }) => API.mkdir(systemId, path, basePath, jwt)
    );

  // Return hook object with loading states and login function
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    mkdir: (
      systemId: string,
      path: string,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<Files.FileStringResponse, Error, MkdirHookParams>
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate({ systemId, path }, options);
    },
  };
};

export default useMkdir;
