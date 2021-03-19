import { put, takeLeading } from 'redux-saga/effects';
import { ACTIONS } from './systems.actions';
import API_ACTIONS from '../sagas/api.actions';

export const systemsListResponseParser = response => response.data.result;

export function* systemsList(action) {
  try {
    /* Parser for axios response with tapis result:

    {
      status: 200,
      data: {
        result: {
        }
      }
    }

    */
    const apiParams = {
      method: 'get',
      service: 'systems',
      path: '/'
    }
    const payload = {
      config: action.payload.config,
      apiCallback: action.payload.apiCallback,
      dispatches: ACTIONS.LIST,
      apiParams,
      responseParser: systemsListResponseParser
    }
    yield put({ type: API_ACTIONS.API.CALL, payload });
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
