import { all } from 'redux-saga/effects';
import { watchLogin } from '../authenticator/authenticator.sagas';
import { watchSystemsListing } from '../systems/systems.sagas';
import { watchApiSagaHelper } from './api.sagas';

export default function* rootSaga() {
  yield all([watchApiSagaHelper(), watchLogin(), watchSystemsListing()]);
}
