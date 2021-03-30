import { ACTIONS } from './streams.actions';

export const initialState = {
  definitions: {},
  loading: false,
  error: null,
};

export const addStream = (definitions, listing) => {
  // Append listing results to existing definitions, generate new object
  const result = { ...definitions };
  listing.forEach((stream) => {
    result[stream.id] = { ...stream };
  });
  return result;
};

export function streams(state = initialState, action) {
  switch (action.type) {
    case ACTIONS.LIST.START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case ACTIONS.LIST.SUCCESS:
      return {
        ...state,
        definitions: addStreams(state.definitions, action.payload),
        loading: false,
        error: null,
      };
    case ACTIONS.LIST.ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
}
