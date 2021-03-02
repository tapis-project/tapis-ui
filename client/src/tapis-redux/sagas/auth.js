import { login } from '../../utils/tapis';
import { call, put, takeLeading } from 'redux-saga/effects';

export function* authLogin(action) {
  try {
    yield put({ type: 'TAPIS_AUTH_LOGIN_START' })
    const userJson = yield call(login, action.payload);
    yield put({ type: 'TAPIS_AUTH_LOGIN_SUCCESS', payload: userJson });
  } catch (error) {
    yield put({
      type: 'TAPIS_AUTH_LOGIN_ERROR',
      payload: error
    });
  }
}

export function* watchLogin() {
  yield takeLeading('TAPIS_AUTH_LOGIN', authLogin);
}
