import { call, put, takeLeading } from 'redux-saga/effects';
import axios from 'axios';
import { 
  TAPIS_AUTH_LOGIN_REQUEST,
  TAPIS_AUTH_LOGIN_SUCCESS,
  TAPIS_AUTH_LOGIN_FAILURE
} from './actionTypes';
import { AuthenticatorLoginRequest } from './types';

export const tapisAuthPassword = ({ username, password, authenticator }) => {
  const url = `${authenticator}/tokens`;
  return axios.post(url, {
    username,
    password,
    grant_type: 'password',
  });
};

export function* authenticatorLogin(action: AuthenticatorLoginRequest) {
  try {
    // Make API call
    const result = yield call(tapisAuthPassword, {
      username: action.payload.username,
      password: action.payload.password,
      authenticator: action.payload.authenticator,
    });
    const token = result.data.result.access_token;
    // Notify tapis-redux store of token
    yield put({
      type: TAPIS_AUTH_LOGIN_SUCCESS,
      payload: token,
    });
    // Call external callback with a copy of the token
    if (action.payload.onApi) {
      yield call(action.payload.onApi, { ...token });
    }
  } catch (error) {
    // Catch any errors and save exception in tapis-redux
    yield put({
      type: TAPIS_AUTH_LOGIN_FAILURE,
      payload: error,
    });
    if (action.payload.onApi) {
      yield call(action.payload.onApi, error);
    }
  }
}

export function* watchLogin() {
  yield takeLeading(TAPIS_AUTH_LOGIN_REQUEST, authenticatorLogin);
}
