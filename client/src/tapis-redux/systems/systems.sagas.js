import { put, takeLeading } from 'redux-saga/effects';
import { listingSuccess } from './systems.fixtures';
import { ACTIONS } from './systems.actions';

export function* systemsList(action) {
  try {
    // Should the saga try to track token state? Or is each
    // client expected to monitor auth'd user and expicitly provide token?
    // const token = action.payload ? action.payload.token : null;
    // const storeToken = yield select(getToken);
    // If no token, operations will return 403
    yield put({ type: ACTIONS.LIST.START });
    // const listingResult = yield call(listing, action.payload);
    const listingResult = listingSuccess;
    yield put({ type: ACTIONS.LIST.SUCCESS, payload: listingResult });
  } catch (error) {
    yield put({
      type: ACTIONS.LIST.ERROR,
      payload: error,
    });
  }
}

export function* watchSystemsListing() {
  yield takeLeading(ACTIONS.LIST.LIST, systemsList);
}
