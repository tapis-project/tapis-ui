import { select, put, takeLeading } from 'redux-saga/effects';
import getToken from '../auth/auth.selectors';
import { listingSuccess } from './systems.fixture';
import { ACTIONS } from './systems.actions';

export function* systemsList(action) {
  try {
    // Should the saga try to track token state? Or is each
    // client expected to monitor auth'd user and expicitly provide token?
    const token = action.token ? action.token : yield select(getToken);
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
