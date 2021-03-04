import { put, takeLeading } from 'redux-saga/effects';
import { authSuccess } from './auth.fixtures';
// import tapisFetch from '../utils';
import { ACTIONS } from './auth.actions';

export function* authLogin(action) {
  try {
    yield put({ type: ACTIONS.LOGIN.START });
    /*
      const tapisFetchParams = {
        tenant: "my-tenant",
        etc.
      } 
      const userJson = yield call(tapisFetch, tapisFetchParams);
    */
    const userJson = authSuccess;
    yield put({ type: ACTIONS.LOGIN.SUCCESS, payload: userJson });
  } catch (error) {
    yield put({
      type: ACTIONS.LOGIN.ERROR,
      payload: error,
    });
  }
}

export function* watchLogin() {
  yield takeLeading(ACTIONS.LOGIN.LOGIN, authLogin);
}
