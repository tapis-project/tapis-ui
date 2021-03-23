export const login = (username, password, authenticator, onApi) => {
  return {
    type: ACTIONS.LOGIN.LOGIN,
    payload: {
      username,
      password,
      authenticator,
      onApi,
    },
  };
};

export const ACTIONS = {
  LOGIN: {
    LOGIN: 'TAPIS_AUTH_LOGIN_LOGIN',
    START: 'TAPIS_AUTH_LOGIN_START',
    SUCCESS: 'TAPIS_AUTH_LOGIN_SUCCESS',
    ERROR: 'TAPIS_AUTH_LOGIN_ERROR',
  },
};
