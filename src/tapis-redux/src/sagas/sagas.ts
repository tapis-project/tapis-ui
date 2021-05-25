import { call, put, select, takeEvery } from 'redux-saga/effects';
import tapisFetch from '../utils/fetch';
import getToken from '../authenticator/selectors';
import { ApiSagaRequest, ApiDispatches } from './types';
import { Config, ApiCallback } from 'tapis-redux/types';
import { TAPIS_REDUX_API_REQUEST, TAPIS_REDUX_API_FAILURE, TAPIS_REDUX_API_SUCCESS } from './actionTypes';

export function* apiSaga<T>(action: ApiSagaRequest<T>) {
  const { config, onApi, dispatches, module, fnName, args } = action.payload;
  try {
    // Notify external reducer that a request has begun
    yield put({ type: dispatches.request });

    // Get any saved token from the current store
    const storeToken = yield select(getToken);

    // Search for a token in a provided tapis config, or just use the store's token
    const token = config ? config.token || storeToken : storeToken;

    // Search for a tenant url a provided tapis config, or just use environment default
    const defaultUrl = process.env.TAPIS_TENANT_URL;
    const tenant = config ? config.tenant || defaultUrl : defaultUrl;

    // Generate a configuration object for the module with the
    // API URL and the authorization header
    const configuration = new (module.Configuration)({
      basePath: tenant,
      headers: {
        "X-Tapis-Token": storeToken.access_token
      }
    });

    // Create an instance of the API
    const api: typeof action.payload.api = new (action.payload.api)(configuration);

    // Call the specified function name, and expect that specific return type
    const result: T = yield call([api, api[fnName]], ...args);

    // Notify the external reducer that we have the desired result
    yield put({ type: dispatches.success, payload: result });

    // If there is an onApi callback, call it now.
    if (onApi) {
      yield call(onApi, result);
    }
  } catch (error) {
    // Notify the external reducer that there is an error
    yield put({ type: dispatches.failure, payload: error });

    // If there is an onApi callback, call it with the error
    if (onApi) {
      yield call(onApi, error);
    }
  }
}

export function* watchApiSaga() {
  yield takeEvery(TAPIS_REDUX_API_REQUEST, apiSaga);
}
