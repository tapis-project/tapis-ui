
import { Authenticator } from '@tapis/tapis-typescript';
import { queryHelper } from 'tapis-api/utils';


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

  // Once the request parameters are wrapped, call queryHelper to
  // perform the operation
  return queryHelper<Authenticator.RespCreateToken>({
    module: Authenticator,
    api: Authenticator.TokensApi,
    func: Authenticator.TokensApi.prototype.createToken,
    args: [ request ],
    basePath,
    jwt: null
  });
};

export default login;