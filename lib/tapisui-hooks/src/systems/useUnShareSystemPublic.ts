import { useMutation, MutateOptions } from 'react-query';
import { Systems } from '@tapis/tapis-typescript';
import { Systems as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';

type UnShareSystemPublicHookParams = {
  systemId: string;
};

const useUnShareSystemPublic = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, mkdir helper is called to perform the operation
  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Systems.RespBasic, Error, UnShareSystemPublicHookParams>(
      [QueryKeys.unShareSystemPublic, basePath, jwt],
      ({ systemId }) => API.unShareSystemPublic(systemId, basePath, jwt)
    );

  // Return hook object with loading states and login function
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    unShareSystemPublic: (
      systemId: string,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<
        Systems.RespBasic,
        Error,
        UnShareSystemPublicHookParams
      >
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate({ systemId }, options);
    },
  };
};

export default useUnShareSystemPublic;
