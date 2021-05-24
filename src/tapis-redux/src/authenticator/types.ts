import { 
  TAPIS_AUTH_LOGIN_REQUEST,
  TAPIS_AUTH_LOGIN_FAILURE,
  TAPIS_AUTH_LOGIN_SUCCESS
} from './actionTypes';

export interface Token {
  access_token: string,
  expires_at: string,
  expires_in: number
}

export type LoginCallback = (result: Token | Error, ...args: any[]) => any;

export interface ILoginRequest {
  username: string,
  password: string,
  authenticator: string,
  onApi?: LoginCallback
}

export interface AuthenticatorState {
  token: Token,
  loading: boolean,
  error: Error
}

export interface AuthenticatorLoginSuccessPayload {
  token: Token
}

export interface AuthenticatorLoginFailurePayload {
  error: Error;
}

export interface AuthenticatorLoginRequest {
  type: typeof TAPIS_AUTH_LOGIN_REQUEST,
  payload: ILoginRequest
}


export type AuthenticatorLoginSuccess = {
  type: typeof TAPIS_AUTH_LOGIN_SUCCESS;
  payload: AuthenticatorLoginSuccessPayload;
};

export type AuthenticatorLoginFailure = {
  type: typeof TAPIS_AUTH_LOGIN_FAILURE;
  payload: AuthenticatorLoginFailurePayload;
};

export type AuthenticatorActions =
  | AuthenticatorLoginRequest
  | AuthenticatorLoginSuccess
  | AuthenticatorLoginFailure;