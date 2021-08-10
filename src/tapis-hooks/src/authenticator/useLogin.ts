import { useContext } from 'react';
import { useMutation } from 'react-query';
import { Authenticator } from '@tapis/tapis-typescript';
import { queryHelper } from '../utils';
import TapisContext from '../context';

interface LoginHelperParams {
  username: string,
  password: string
}

type LoginParams = {
  onSuccess?: (data: Authenticator.RespCreateToken) => any,
  onError?: (error) => any
} & LoginHelperParams

const useLogin = () => {
  const tapisContext = useContext(TapisContext);

  // On successful login, save the token to the TapisContext state
  const onSuccess = (response: Authenticator.RespCreateToken) => {
    tapisContext.setAccessToken(response.result.access_token);
  }
 
  // This helper takes the username and password and assembles an API call
  const loginHelper = ({ username, password }: LoginHelperParams): Promise<Authenticator.RespCreateToken>  => {
    const reqCreateToken: Authenticator.ReqCreateToken = {
      username,
      password,
      grant_type: 'password'
    }
    const request: Authenticator.CreateTokenRequest = {
      reqCreateToken
    }

    // Once the request parameters are wrapped, call queryHelper to
    // perform the operation
    return queryHelper<Authenticator.RespCreateToken>({
      module: Authenticator,
      api: Authenticator.TokensApi,
      func: Authenticator.TokensApi.prototype.createToken,
      args: [ request ],
    }, tapisContext);
  };

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, loginHelper is called to perform the operation, with an onSuccess callback
  // passed as an option
  const { mutate, isLoading, isError, isSuccess, error } = useMutation(loginHelper, { onSuccess });

  // Return hook object with loading states and login function
  return {
    isLoading,
    isError,
    isSuccess,
    error,
    login: (params: LoginParams) => {
      const { username, password, onSuccess, onError } = params;

      // Call mutate to trigger a single post-like API operation
      return mutate(
        { username, password },
        { 
          onSuccess,
          onError
        }
    )
    }
  }
}

export default useLogin;