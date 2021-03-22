export const defaultResponseParser = (response) => response.data.result;

export const API_ACTIONS = {
  API: {
    CALL: 'TAPIS_REDUX_API_CALL',
    START: 'TAPIS_REDUX_API_START',
    SUCCESS: 'TAPIS_REDUX_API_SUCCESS',
    ERROR: 'TAPIS_REDUX_API_ERROR',
  },
};
