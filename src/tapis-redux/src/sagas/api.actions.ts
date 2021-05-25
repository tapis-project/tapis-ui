import { ApiSagaDispatch, ApiSagaRequest } from './types';
import { TAPIS_REDUX_API_REQUEST } from './actionTypes';

export const defaultResponseParser = (response) => response.data.result;

export function apiCall<T>(dispatch: ApiSagaDispatch<T>): ApiSagaRequest<T> {
  return {
    type: TAPIS_REDUX_API_REQUEST,
    payload: dispatch
  }
}
 
/*
export const apiCall = ({
  config,
  onApi,
  dispatches,
  apiParams,
  responseParser,
}) => {
  return {
    type: API_ACTIONS.API.CALL,
    payload: {
      config,
      onApi,
      dispatches,
      apiParams,
      responseParser: responseParser || defaultResponseParser,
    },
  };
};
*/

export const API_ACTIONS = {
  API: {
    CALL: 'TAPIS_REDUX_API_CALL',
    START: 'TAPIS_REDUX_API_START',
    SUCCESS: 'TAPIS_REDUX_API_SUCCESS',
    ERROR: 'TAPIS_REDUX_API_ERROR',
  },
};
