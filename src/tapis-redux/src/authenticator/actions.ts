import {
  TAPIS_AUTH_LOGIN_FAILURE,
  TAPIS_AUTH_LOGIN_SUCCESS,
  TAPIS_AUTH_LOGIN_REQUEST
} from "./actionTypes";
import {
  AuthenticatorLoginFailure,
  AuthenticatorLoginFailurePayload,
  AuthenticatorLoginRequest,
  AuthenticatorLoginSuccess,
  AuthenticatorLoginSuccessPayload,
  LoginRequest
} from "./types";

export const authenticatorLoginRequest = (
  request: LoginRequest
): AuthenticatorLoginRequest => ({
  type: TAPIS_AUTH_LOGIN_REQUEST,
  payload: request
});

export const authenticatorLoginSuccess = (
  payload: AuthenticatorLoginSuccessPayload
): AuthenticatorLoginSuccess => ({
  type: TAPIS_AUTH_LOGIN_SUCCESS,
  payload,
});

export const authenticatorLoginFailure = (
  payload: AuthenticatorLoginFailurePayload
): AuthenticatorLoginFailure => ({
  type: TAPIS_AUTH_LOGIN_FAILURE,
  payload,
});