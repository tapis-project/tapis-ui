import { all } from 'redux-saga/effects';
import { watchLogin } from '../authenticator/authenticator.sagas';
import { watchSystemsListing } from '../systems/systems.sagas';

export default function* rootSaga() {
  yield all([watchLogin(), watchSystemsListing()]);
}
