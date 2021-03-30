import { apiCall } from '../sagas/api.actions';


export const list = (config, onApi) => {
  // Generate a dispatch that calls the API saga with
  // a streams listing payload
  return apiCall({
    config,
    onApi,
    dispatches: ACTIONS.LIST,
    apiParams: {
      method: 'get',
      service: 'streams',
      path: '/projects',
    },
  });
};

export const ACTIONS = {
  LIST: {
    LIST: 'TAPIS_STREAMS_LIST_LIST',
    START: 'TAPIS_STREAMS_LIST_START',
    SUCCESS: 'TAPIS_STREAMS_LIST_SUCCESS',
    ERROR: 'TAPIS_STREAMS_LIST_ERROR',
  },
};
