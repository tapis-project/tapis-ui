import { useContext } from 'react';
import { useMutation } from 'react-query';
import { Authenticator } from '@tapis/tapis-typescript';
import { useTapisMutation } from '../useTapisQuery';
import { OnSuccessCallback } from '../useTapisQuery/types';
import { queryHelper } from '../useTapisQuery/useTapisQuery';
import TapisContext from '../context';

const useLogin = () => {
  const tapisContext = useContext(TapisContext);

  // Save login state to tapis context for future calls
  const onSuccessContext = (response: Authenticator.RespCreateToken) => {
    tapisContext.setAccessToken(response.result.access_token);
  }
 
  const loginFn = ({ username, password }): Promise<Authenticator.RespCreateToken>  => {
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
    }, tapisContext)
  };

  const { mutate, isLoading, isError, isSuccess, error } = useMutation(loginFn, { onSuccess: onSuccessContext });

  return {
    isLoading,
    isError,
    isSuccess,
    error,
    login: (username, password, onAuth ) => mutate(
      { username, password },
      { 
        onSuccess: (data) => {
          onSuccessContext(data);
          if (onAuth) {
            onAuth(data.result)
          };
        },
        onError: async (error: any) => {
          if (onAuth) {
            if (error.json) {
              error = await error.json();
            }
            onAuth(error);
          }
        }
      }
    )
  }
}

export default useLogin;