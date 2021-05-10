import { call, put, select, takeEvery } from 'redux-saga/effects';
import getToken from '../authenticator/authenticator.selectors';
import tapisFetch from '../utils';
import { API_ACTIONS } from './api.actions';

export function* apiSaga(action) {
  const { config, onApi, apiParams, dispatches, responseParser } =
    action.payload;
  try {
    yield put({ type: dispatches.START });
    const storeToken = yield select(getToken);
    // Search for a token in a provided tapis config, or just use the store's token
    const token = config ? config.token || storeToken : storeToken;
    // Search for a tenant url a provided tapis config, or just use environment default
    const defaultUrl = process.env.TAPIS_TENANT_URL;
    const tenant = config ? config.tenant || defaultUrl : defaultUrl;
    const fetchParams = {
      method: apiParams.method,
      token: token.access_token,
      service: apiParams.service,
      path: apiParams.path,
      params: apiParams.params,
      tenant,
      data: apiParams.data,
    };
    const response = yield call(tapisFetch, fetchParams);
    const result = responseParser(response);
    yield put({ type: dispatches.SUCCESS, payload: result });
    if (onApi) {
      yield call(onApi, result);
    }
  } catch (error) {
    yield put({ type: dispatches.ERROR, payload: error });
    if (onApi) {
      yield call(onApi, error);
    }
  }
}

export function* watchApiSaga() {
  yield takeEvery(API_ACTIONS.API.CALL, apiSaga);
}
