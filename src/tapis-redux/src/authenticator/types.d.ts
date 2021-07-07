import { TAPIS_AUTH_LOGIN_REQUEST, TAPIS_AUTH_LOGIN_FAILURE, TAPIS_AUTH_LOGIN_SUCCESS } from './actionTypes';
import { ApiCallback, Config } from 'tapis-redux/types';
import { Authenticator } from '@tapis/tapis-typescript';
export declare type Token = Authenticator.NewAccessTokenResponse;
export declare type LoginCallback = ApiCallback<Token>;
export interface LoginRequest {
    username: string;
    password: string;
    config?: Config;
    onAuth?: LoginCallback;
}
export interface AuthenticatorState {
    token: Token;
    loading: boolean;
    error: Error;
}
export interface AuthenticatorLoginSuccessPayload {
    token: Token;
}
export interface AuthenticatorLoginFailurePayload {
    error: Error;
}
export interface AuthenticatorLoginRequest {
    type: typeof TAPIS_AUTH_LOGIN_REQUEST;
    payload: LoginRequest;
}
export declare type AuthenticatorLoginSuccess = {
    type: typeof TAPIS_AUTH_LOGIN_SUCCESS;
    payload: AuthenticatorLoginSuccessPayload;
};
export declare type AuthenticatorLoginFailure = {
    type: typeof TAPIS_AUTH_LOGIN_FAILURE;
    payload: AuthenticatorLoginFailurePayload;
};
export declare type AuthenticatorActions = AuthenticatorLoginRequest | AuthenticatorLoginSuccess | AuthenticatorLoginFailure;
