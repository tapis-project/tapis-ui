import { call, put, takeLeading } from 'redux-saga/effects';
import axios from 'axios';
// import tapisFetch from '../utils';
import { ACTIONS } from './authenticator.actions';

export const tapisAuthPassword = ({ username, password, authenticator }) => {
  const url = `${authenticator}/tokens`;
  return axios.post(url, {
    username,
    password,
    grant_type: 'password',
  });
};

export function* authenticatorLogin(action) {
  try {
    // Notify tapis-redux that login action has started
    yield put({ type: ACTIONS.LOGIN.START });
    // Make API call
    const result = yield call(tapisAuthPassword, {
      username: action.payload.username,
      password: action.payload.password,
      authenticator: action.payload.authenticator,
    });
    const token = result.data.result.access_token;
    // Notify tapis-redux store of token
    yield put({
      type: ACTIONS.LOGIN.SUCCESS,
      payload: token,
    });
    // Call external callback with a copy of the token
    if (action.payload.onApi) {
      yield call(action.payload.onApi, { ...token });
    }
  } catch (error) {
    // Catch any errors and save exception in tapis-redux
    yield put({
      type: ACTIONS.LOGIN.ERROR,
      payload: error,
    });
    if (action.payload.callback) {
      yield call(action.payload.onApi, error);
    }
  }
}

export function* watchLogin() {
  yield takeLeading(ACTIONS.LOGIN.LOGIN, authenticatorLogin);
}
