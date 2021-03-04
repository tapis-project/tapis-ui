import { all } from 'redux-saga/effects';
import { watchLogin } from '../auth/auth.saga';

export default function* rootSaga() {
  yield all([watchLogin()]);
}
