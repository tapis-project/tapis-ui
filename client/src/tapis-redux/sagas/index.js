import { all } from 'redux-saga/effects';
import { watchLogin } from '../auth/auth.saga';
import { watchSystemsListing } from '../systems/systems.saga';

export default function* rootSaga() {
  yield all([watchLogin(), watchSystemsListing()]);
}
