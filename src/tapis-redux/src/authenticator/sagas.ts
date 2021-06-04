import { call, put, takeLeading } from 'redux-saga/effects';
import { 
  TAPIS_AUTH_LOGIN_REQUEST,
  TAPIS_AUTH_LOGIN_SUCCESS,
  TAPIS_AUTH_LOGIN_FAILURE
} from './actionTypes';
import { AuthenticatorLoginRequest } from './types';
import { Authenticator } from '@tapis/tapis-typescript';
import fetch from 'cross-fetch';

export function* tapisAuth(payload) {
    const { config, username, password } = payload;

    // Authenticator does not seem to be properly supported in the API Spec
    // Search for a tenant url a provided tapis config, or just use environment default
    const defaultUrl = process.env.TAPIS_TENANT_URL;
    const tenant = config ? config.tenant || defaultUrl : defaultUrl;

    // Generate a configuration object for the module with the
    // API URL and the authorization header
    const configuration = new (Authenticator.Configuration)({
      basePath: tenant,
      fetchApi: fetch
    });
    const api: Authenticator.TokensApi = new Authenticator.TokensApi(configuration);
    const reqCreateToken: Authenticator.ReqCreateToken = {
      grant_type: "password",
      username,
      password
    }
    const request: Authenticator.CreateTokenRequest = {
      reqCreateToken
    }
    // Make API call
    const response: Authenticator.RespCreateToken = yield call([api, api.createToken], request);
    return response.result.access_token;
}

export function* authenticatorLogin(action: AuthenticatorLoginRequest) {
  try {
    const token = yield call(tapisAuth, action.payload);
    // Notify tapis-redux store of token
    yield put({
      type: TAPIS_AUTH_LOGIN_SUCCESS,
      payload: { token }
    });
    // Call external callback with a copy of the token
    if (action.payload.onAuth) {
      yield call(action.payload.onAuth, { ...token });
    }
  } catch (error) {
    // Catch any errors and save exception in tapis-redux
    yield put({
      type: TAPIS_AUTH_LOGIN_FAILURE,
      payload: { error }
    });
    if (action.payload.onAuth) {
      yield call(action.payload.onAuth, error);
    }
  }
}

export function* watchLogin() {
  yield takeLeading(TAPIS_AUTH_LOGIN_REQUEST, authenticatorLogin);
}
