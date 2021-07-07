import { AuthenticatorLoginRequest } from './types';
import { Authenticator } from '@tapis/tapis-typescript';
export declare function tapisAuth(payload: any): Generator<import("redux-saga/effects").CallEffect<Authenticator.RespCreateToken>, Authenticator.NewAccessTokenResponse, Authenticator.RespCreateToken>;
export declare function authenticatorLogin(action: AuthenticatorLoginRequest): Generator<import("redux-saga/effects").CallEffect<unknown> | import("redux-saga/effects").PutEffect<{
    type: string;
    payload: {
        token: any;
    };
}> | import("redux-saga/effects").PutEffect<{
    type: string;
    payload: {
        error: any;
    };
}>, void, unknown>;
export declare function watchLogin(): Generator<import("redux-saga/effects").ForkEffect<never>, void, unknown>;
