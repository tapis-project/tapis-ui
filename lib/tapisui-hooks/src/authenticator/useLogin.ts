import { useMutation } from 'react-query';
import { Authenticator } from '@tapis/tapis-typescript';
import { Authenticator as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';

type LoginHookParams = {
  username: string;
  password: string;
};

const useLogin = () => {
  const { setAccessToken, basePath } = useTapisConfig();

  // On successful login, save the token to the TapisContext state
  const onSuccess = (response: Authenticator.RespCreateToken) => {
    setAccessToken(response?.result?.access_token);
  };

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, loginHelper is called to perform the operation, with an onSuccess callback
  // passed as an option
  const { mutate, isLoading, isError, isSuccess, error } = useMutation<
    Authenticator.RespCreateToken,
    Error,
    LoginHookParams
  >(
    [QueryKeys.login, basePath],
    ({ username, password }) => API.login(username, password, basePath),
    { onSuccess }
  );

  // Return hook object with loading states and login function
  return {
    isLoading,
    isError,
    isSuccess,
    error,
    login: (username: string, password: string) => {
      // Call mutate to trigger a single post-like API operation
      return mutate({ username, password });
    },
    logout: () => setAccessToken(null),
  };
};

export default useLogin;
