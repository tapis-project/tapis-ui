import { ACTIONS } from './authenticator.actions';

export const initialState = {
  token: null,
  loading: false,
  error: null,
};

export default function authenticator(state = initialState, action) {
  switch (action.type) {
    case ACTIONS.LOGIN.START:
      return {
        ...state,
        token: null,
        loading: true,
        error: null,
      };
    case ACTIONS.LOGIN.SUCCESS:
      return {
        ...state,
        token: action.payload,
        loading: false,
        error: null,
      };
    case ACTIONS.LOGIN.ERROR:
      return {
        ...state,
        token: null,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
}
