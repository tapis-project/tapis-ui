import { useMutation, MutateOptions } from 'react-query';
import { Files } from '@tapis/tapis-typescript';
import { Files as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';

export type DeleteHookParams = {
  systemId: string;
  path: string;
};

const useDelete = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, _delete helper is called to perform the operation
  const {
    mutate,
    mutateAsync,
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
  } = useMutation<Files.FileStringResponse, Error, DeleteHookParams>(
    [QueryKeys.delete, basePath, jwt],
    ({ systemId, path }) => API.deleteFile(systemId, path, basePath, jwt)
  );

  // Return hook object with loading states and login function
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    deleteFile: (
      params: DeleteHookParams,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<Files.FileStringResponse, Error, DeleteHookParams>
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate(params, options);
    },
    deleteFileAsync: (
      params: DeleteHookParams,
      options?: MutateOptions<Files.FileStringResponse, Error, DeleteHookParams>
    ) => mutateAsync(params, options),
  };
};

export default useDelete;
