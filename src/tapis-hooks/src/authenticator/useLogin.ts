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

  // Save login state to tapis context for future calls
  const onSuccess = (response: Authenticator.RespCreateToken) => {
    tapisContext.setAccessToken(response.result.access_token);
  }
 
  const loginHelper = ({ username, password }: LoginHelperParams): Promise<Authenticator.RespCreateToken>  => {
    const reqCreateToken: Authenticator.ReqCreateToken = {
      username,
      password,
      grant_type: 'password'
    }
    const request: Authenticator.CreateTokenRequest = {
      reqCreateToken
    }
    return queryHelper<Authenticator.RespCreateToken>({
      module: Authenticator,
      api: Authenticator.TokensApi,
      func: Authenticator.TokensApi.prototype.createToken,
      args: [ request ],
    }, tapisContext);
  };

  const { mutate, isLoading, isError, isSuccess, error } = useMutation(loginHelper, { onSuccess });

  return {
    isLoading,
    isError,
    isSuccess,
    error,
    login: (params: LoginParams) => {
      const { username, password, onSuccess, onError } = params;
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