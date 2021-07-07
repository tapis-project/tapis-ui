import { AuthenticatorLoginFailure, AuthenticatorLoginFailurePayload, AuthenticatorLoginRequest, AuthenticatorLoginSuccess, AuthenticatorLoginSuccessPayload, LoginRequest } from "./types";
export declare const authenticatorLoginRequest: (request: LoginRequest) => AuthenticatorLoginRequest;
export declare const authenticatorLoginSuccess: (payload: AuthenticatorLoginSuccessPayload) => AuthenticatorLoginSuccess;
export declare const authenticatorLoginFailure: (payload: AuthenticatorLoginFailurePayload) => AuthenticatorLoginFailure;
