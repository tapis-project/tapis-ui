import { AuthenticatorState, AuthenticatorActions } from './types';
import {
  TAPIS_AUTH_LOGIN_REQUEST,
  TAPIS_AUTH_LOGIN_FAILURE,
  TAPIS_AUTH_LOGIN_SUCCESS,
  TAPIS_AUTH_LOGOUT_REQUEST
} from './actionTypes';

export const initialState: AuthenticatorState = {
  token: null,
  loading: false,
  error: null,
};

export const authenticator = (state: AuthenticatorState = initialState, action: AuthenticatorActions): AuthenticatorState => {
  switch (action.type) {
    case TAPIS_AUTH_LOGIN_REQUEST:
      return {
        ...state,
        token: null,
        loading: true,
        error: null,
      };
    case TAPIS_AUTH_LOGIN_SUCCESS:
      return {
        ...state,
        token: action.payload.response.result?.access_token ?? null,
        loading: false,
        error: null,
      };
    case TAPIS_AUTH_LOGIN_FAILURE:
      return {
        ...state,
        token: null,
        loading: false,
        error: action.payload.error,
      };
    case TAPIS_AUTH_LOGOUT_REQUEST:
      return {
        ...state,
        token: null,
        loading: false,
        error: null
      }
    default:
      return state;
  }
}