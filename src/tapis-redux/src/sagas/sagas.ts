import { call, put, select, takeEvery } from 'redux-saga/effects';
import getToken from '../authenticator/selectors';
import { ApiSagaRequest } from './types';
import * as ACTIONS from './actionTypes';

export function* apiSaga<T>(action: ApiSagaRequest<T>) {
  const { config, onApi, dispatches, module, func, args } = action.payload;
  try {
    // Notify external reducer that a request has begun
    yield put({ type: dispatches.request });

    // Get any saved token from the current store
    const storeToken = yield select(getToken);

    // Search for a token in a provided tapis config, or just use the store's token
    const token = config ? config.jwt || storeToken.access_token : storeToken.access_token;

    // Search for a tenant url a provided tapis config, or just use environment default
    const defaultUrl = process.env.TAPIS_TENANT_URL;
    const tenant = config ? config.tenant || defaultUrl : defaultUrl;

    // Generate a configuration object for the module with the
    // API URL and the authorization header
    const configuration = new (module.Configuration)({
      basePath: tenant,
      headers: {
        "X-Tapis-Token": token
      }
    });

    // Create an instance of the API
    const api: typeof action.payload.api = new (action.payload.api)(configuration);

    // Call the specified function name, and expect that specific return type
    const result: T = yield call([api, func], ...args);

    // Notify the external reducer that we have the desired result
    yield put({ type: dispatches.success, payload: result });

    // If there is an onApi callback, call it now.
    if (onApi) {
      yield call(onApi, result);
    }

    // Send general SUCCESS event
    yield put({ type: ACTIONS.TAPIS_REDUX_API_SUCCESS });
  } catch (error) {
    // Notify the external reducer that there is an error
    yield put({ type: dispatches.failure, payload: error });

    // If there is an onApi callback, call it with the error
    if (onApi) {
      yield call(onApi, error);
    }

    // Send general FAILURE event
    yield put({ type: ACTIONS.TAPIS_REDUX_API_FAILURE });
  }
}

export function* watchApiSaga() {
  yield takeEvery(ACTIONS.TAPIS_REDUX_API_REQUEST, apiSaga);
}
