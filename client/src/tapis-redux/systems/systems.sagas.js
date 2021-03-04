import { select, put, takeLeading } from 'redux-saga/effects';
import getToken from '../auth/auth.selectors';
import { listingSuccess } from './systems.fixtures';
import { ACTIONS } from './systems.actions';

export function* systemsList(action) {
  try {
    // Should the saga try to track token state? Or is each
    // client expected to monitor auth'd user and expicitly provide token?
    let token = action.payload ? action.payload.token : null;
    if (!token) {
      token = yield select(getToken);
    }
    if (!token) {
      yield put({
        type: ACTIONS.LIST.FAILED,
        payload: 'tapis-redux not logged in',
      });
    } else {
      yield put({ type: ACTIONS.LIST.START });
      // const listingResult = yield call(listing, action.payload);
      const listingResult = listingSuccess;
      yield put({ type: ACTIONS.LIST.SUCCESS, payload: listingResult });
    }
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
