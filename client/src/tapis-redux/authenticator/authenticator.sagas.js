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
    yield put({ type: ACTIONS.LOGIN.START });
    const result = yield call(tapisAuthPassword, {
      username: action.payload.username,
      password: action.payload.password,
      authenticator: action.payload.authenticator,
    });
    yield put({
      type: ACTIONS.LOGIN.SUCCESS,
      payload: result.data.result.access_token,
    });
  } catch (error) {
    yield put({
      type: ACTIONS.LOGIN.ERROR,
      payload: error,
    });
  }
}

export function* watchLogin() {
  yield takeLeading(ACTIONS.LOGIN.LOGIN, authenticatorLogin);
}
