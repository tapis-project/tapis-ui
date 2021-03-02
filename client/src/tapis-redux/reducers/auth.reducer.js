export const initialState = {
  user: null,
  loading: false,
  error: null
};

export default function auth(state = initialState, action) {
  switch (action.type) {
    case 'TAPIS_AUTH_LOGIN_START': 
      return {
        ...state,
        user: null,
        loading: true,
        error: null
      }
    case 'TAPIS_AUTH_LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null
      };
    case 'TAPIS_AUTH_LOGIN_ERROR':
      return {
        ...state,
        user: null,
        loading: false,
        error: action.payload
      };
    default:
      return state;
  }
}
