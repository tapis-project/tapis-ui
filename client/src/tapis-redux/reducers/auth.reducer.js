import { ACTIONS } from '../actions/auth';

export const initialState = {
  user: null,
  loading: false,
  error: null,
  failed: false
};

export default function auth(state = initialState, action) {
  console.log("Action", action);
  switch (action.type) {
    case ACTIONS.LOGIN.START:
      return {
        ...state,
        user: null,
        loading: true,
        error: null,
        failed: false
      };
    case ACTIONS.LOGIN.SUCCESS:
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null,
        failed: false
      };
    case ACTIONS.LOGIN.ERROR:
      return {
        ...state,
        user: null,
        loading: false,
        error: action.payload,
        failed: false
      };
    case ACTIONS.LOGIN.FAILED:
      return {
        ...state,
        user: null,
        loading: false,
        error: null,
        failed: true
      }
    default:
      return state;
  }
}
