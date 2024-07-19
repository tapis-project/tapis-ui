import { useMutation, MutateOptions } from 'react-query';
import { Files as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';
import { DownloadStreamParams } from '.';

const useDownload = () => {
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
  } = useMutation<Response, Error, DownloadStreamParams>(
    [QueryKeys.download, basePath, jwt],
    ({ systemId, path, destination, zip = false, onStart = null }) =>
      API.downloadStream(
        systemId,
        path,
        destination,
        zip,
        onStart,
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
    download: (
      params: DownloadStreamParams,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<Response, Error, DownloadStreamParams>
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate(params, options);
    },
    downloadAsync: (
      params: DownloadStreamParams,
      options?: MutateOptions<Response, Error, DownloadStreamParams>
    ) => mutateAsync(params, options),
  };
};

export default useDownload;
