export const list = (token) => {
  return {
    type: ACTIONS.LIST.LIST,
    token,
  };
};

export const ACTIONS = {
  LIST: {
    LIST: 'TAPIS_SYSTEMS_LIST_LIST',
    START: 'TAPIS_SYSTEMS_LIST_START',
    SUCCESS: 'TAPIS_SYSTEMS_LIST_SUCCESS',
    ERROR: 'TAPIS_SYSTEMS_LIST_ERROR',
    FAILED: 'TAPIS_SYSTEMS_LIST_FAILED',
  },
};
