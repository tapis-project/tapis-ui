import { ApiSagaPayload, ApiSagaRequest } from './types';
import { TAPIS_REDUX_API_REQUEST } from './actionTypes';

export function apiCall<T>(dispatch: ApiSagaPayload<T>): ApiSagaRequest<T> {
  return {
    type: TAPIS_REDUX_API_REQUEST,
    payload: dispatch
  }
} 