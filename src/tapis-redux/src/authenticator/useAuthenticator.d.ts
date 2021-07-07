import { LoginCallback } from './types';
import { Config } from '../types/config';
declare const useAuthenticator: (config: Config) => {
    token: import("@tapis/tapis-typescript-authenticator").NewAccessTokenResponse;
    loading: boolean;
    error: Error;
    login: (username: any, password: any, onAuth?: LoginCallback) => import("./types").AuthenticatorLoginRequest;
};
export default useAuthenticator;
