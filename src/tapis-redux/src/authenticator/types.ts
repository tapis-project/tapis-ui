import { 
  TAPIS_AUTH_LOGIN_REQUEST,
  TAPIS_AUTH_LOGIN_FAILURE,
  TAPIS_AUTH_LOGIN_SUCCESS
} from './actionTypes';

export type LoginCallback = (result: any, ...args: any[]) => any;

export interface ILoginRequest {
  username: string,
  password: string,
  authenticator: string,
  onApi?: LoginCallback
}

export interface AuthenticatorState {
  // TODO: replace with token type
  token: any,
  loading: boolean,
  error: any
}

export interface AuthenticatorLoginSuccessPayload {
  token: any
}

export interface AuthenticatorLoginFailurePayload {
  error: any;
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