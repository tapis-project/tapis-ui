import { call, put, select, takeEvery } from 'redux-saga/effects';
import tapisFetch from '../utils/fetch';
import getToken from '../authenticator/selectors';
import { ApiSagaRequest, ApiDispatches, ApiCallback } from './types';
import { Config } from 'tapis-redux/types';
import { TAPIS_REDUX_API_REQUEST, TAPIS_REDUX_API_FAILURE, TAPIS_REDUX_API_SUCCESS } from './actionTypes';

export function* apiSaga<T>(action: ApiSagaRequest<T>) {
  console.log("API SAGA", action);
  console.log(typeof action.payload.module);
  const config: Config = action.payload.config;
  const onApi: ApiCallback<T> = action.payload.onApi;
  const dispatches: ApiDispatches = action.payload.dispatches;
  const module = action.payload.module;
  const fnName = action.payload.fnName;
  const args = action.payload.args;
  try {
    yield put({ type: dispatches.request });
    const storeToken = yield select(getToken);
    // Search for a token in a provided tapis config, or just use the store's token
    const token = config ? config.token || storeToken : storeToken;
    // Search for a tenant url a provided tapis config, or just use environment default
    const defaultUrl = process.env.TAPIS_TENANT_URL;
    const tenant = config ? config.tenant || defaultUrl : defaultUrl;
    const configuration = new (module.Configuration)({
      basePath: tenant,
      headers: {
        "X-Tapis-Token": storeToken.access_token
      }
    });
    const api = new (action.payload.api)(configuration);
    const result: T = yield call([api, api[fnName]], ...args);
    yield put({ type: dispatches.success, payload: result });
    if (onApi) {
      yield call(onApi, result);
    }
  } catch (error) {
    yield put({ type: dispatches.failure, payload: error });
    if (onApi) {
      yield call(onApi, error);
    }
  }
}

export function* watchApiSaga() {
  yield takeEvery(TAPIS_REDUX_API_REQUEST, apiSaga);
}
