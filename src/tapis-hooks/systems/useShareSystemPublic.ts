import { useMutation, MutateOptions } from 'react-query';
import { Systems } from '@tapis/tapis-typescript';
import { shareSystemPublic } from '../../tapis-api/systems';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';

type ShareSystemPublicHookParams = {
  systemId: string;
};

const useShareSystemPublic = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, mkdir helper is called to perform the operation
  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Systems.RespBasic, Error, ShareSystemPublicHookParams>(
      [QueryKeys.shareSystemPublic, basePath, jwt],
      ({ systemId }) => shareSystemPublic(systemId, basePath, jwt)
    );

  // Return hook object with loading states and login function
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    shareSystemPublic: (
      systemId: string,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<
        Systems.RespBasic,
        Error,
        ShareSystemPublicHookParams
      >
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate({ systemId }, options);
    },
  };
};

export default useShareSystemPublic;
