import { apiCall } from '../sagas/api.actions';

export const list = (config, onApi) => {
  // Generate a dispatch that calls the API saga with
  // a systems listing payload
  return apiCall({
    config,
    onApi,
    dispatches: ACTIONS.LIST,
    apiParams: {
      method: 'get',
      service: 'systems',
      path: '/',
    },
  });
};

export const ACTIONS = {
  LIST: {
    LIST: 'TAPIS_SYSTEMS_LIST_LIST',
    START: 'TAPIS_SYSTEMS_LIST_START',
    SUCCESS: 'TAPIS_SYSTEMS_LIST_SUCCESS',
    ERROR: 'TAPIS_SYSTEMS_LIST_ERROR',
  },
};
