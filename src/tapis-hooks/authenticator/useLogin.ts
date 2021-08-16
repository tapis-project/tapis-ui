import { useMutation } from 'react-query';
import { Authenticator } from '@tapis/tapis-typescript';
import { login } from 'tapis-api/authenticator';
import { useTapisConfig } from 'tapis-hooks';

type LoginHookParams = {
  username: string,
  password: string,
  onSuccess?: (data: Authenticator.RespCreateToken) => any,
  onError?: (error: any) => any
}

const useLogin = () => {
  const { setAccessToken, basePath } = useTapisConfig();

  // On successful login, save the token to the TapisContext state
  const onSuccess = (response: Authenticator.RespCreateToken) => {
    setAccessToken(response?.result?.access_token);
  }
 
  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, loginHelper is called to perform the operation, with an onSuccess callback
  // passed as an option
  const { mutate, isLoading, isError, isSuccess, error } = useMutation(login, { onSuccess });

  // Return hook object with loading states and login function
  return {
    isLoading,
    isError,
    isSuccess,
    error,
    login: (params: LoginHookParams) => {
      const { username, password, onSuccess, onError } = params;

      // Call mutate to trigger a single post-like API operation
      return mutate(
        { username, password, basePath },
        { 
          onSuccess,
          onError
        }
      )
    },
    logout: () => setAccessToken(null)
  }
}

export default useLogin;