import { ApiSagaDispatch, ApiSagaRequest } from './types';
import { TAPIS_REDUX_API_REQUEST } from './actionTypes';

export function apiCall<T>(dispatch: ApiSagaDispatch<T>): ApiSagaRequest<T> {
  return {
    type: TAPIS_REDUX_API_REQUEST,
    payload: dispatch
  }
} 