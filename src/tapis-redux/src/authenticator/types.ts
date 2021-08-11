import { 
  TAPIS_AUTH_LOGIN_REQUEST,
  TAPIS_AUTH_LOGIN_FAILURE,
  TAPIS_AUTH_LOGIN_SUCCESS,
  TAPIS_AUTH_LOGOUT_REQUEST
} from './actionTypes';
import { ApiCallback, Config } from 'tapis-redux/types';
import { Authenticator } from '@tapis/tapis-typescript';

export type Token = Authenticator.NewAccessTokenResponse;

export type LoginCallback = ApiCallback<Authenticator.RespCreateToken>;

export interface LoginRequest {
  username: string,
  password: string,
  config?: Config,
  onAuth?: LoginCallback
}

export interface AuthenticatorState {
  token: Token,
  loading: boolean,
  error: Error
}

export interface AuthenticatorLoginSuccessPayload {
  response: Authenticator.RespCreateToken
}

export interface AuthenticatorLoginFailurePayload {
  error: Error;
}

export interface AuthenticatorLoginRequest {
  type: typeof TAPIS_AUTH_LOGIN_REQUEST,
  payload: LoginRequest
}


export type AuthenticatorLoginSuccess = {
  type: typeof TAPIS_AUTH_LOGIN_SUCCESS;
  payload: AuthenticatorLoginSuccessPayload;
};

export type AuthenticatorLoginFailure = {
  type: typeof TAPIS_AUTH_LOGIN_FAILURE;
  payload: AuthenticatorLoginFailurePayload;
};

export type AuthenticatorLogoutRequest = {
  type: typeof TAPIS_AUTH_LOGOUT_REQUEST;
}

export type AuthenticatorActions =
  | AuthenticatorLoginRequest
  | AuthenticatorLoginSuccess
  | AuthenticatorLoginFailure
  | AuthenticatorLogoutRequest;