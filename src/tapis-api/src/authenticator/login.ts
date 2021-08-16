
import { Authenticator } from '@tapis/tapis-typescript';
import { apiGenerator } from 'tapis-api/src/utils';
import { errorDecoder } from 'tapis-api/src/utils';


export interface LoginParams {
  username: string,
  password: string,
  basePath: string
}

// This helper takes the username and password and assembles an API call
const login = ({ username, password, basePath }: LoginParams): Promise<Authenticator.RespCreateToken>  => {
  const reqCreateToken: Authenticator.ReqCreateToken = {
    username,
    password,
    grant_type: 'password'
  }
  const request: Authenticator.CreateTokenRequest = {
    reqCreateToken
  }

  const api: Authenticator.TokensApi = apiGenerator<Authenticator.TokensApi>(
    Authenticator, Authenticator.TokensApi, basePath, null
  );

  return errorDecoder(
    () => api.createToken(request)
  )
};

export default login;