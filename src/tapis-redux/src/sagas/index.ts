import { all } from 'redux-saga/effects';
import { watchLogin } from '../authenticator/sagas';
import { watchApiSaga } from './sagas';

export default function* rootSaga() {
  yield all([watchApiSaga(), watchLogin()]);
}
