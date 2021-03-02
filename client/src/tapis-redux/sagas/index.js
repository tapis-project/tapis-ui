import { all } from 'redux-saga/effects';
import { watchLogin } from './auth';

export default function* rootSaga() {
  yield all([
    watchLogin()
  ]);
}
