import { defaultResponseParser, API_ACTIONS } from '../sagas/api.actions';

export const list = (config, onApi) => {
  // Generate a dispatch that calls the API saga with
  // a systems listing payload
  return {
    type: API_ACTIONS.API.CALL,
    payload: {
      config,
      onApi,
      dispatches: ACTIONS.LIST,
      apiParams: {
        method: 'get',
        service: 'systems',
        path: '/',
      },
      responseParser: defaultResponseParser,
    },
  };
};

export const ACTIONS = {
  LIST: {
    LIST: 'TAPIS_SYSTEMS_LIST_LIST',
    START: 'TAPIS_SYSTEMS_LIST_START',
    SUCCESS: 'TAPIS_SYSTEMS_LIST_SUCCESS',
    ERROR: 'TAPIS_SYSTEMS_LIST_ERROR',
  },
};
