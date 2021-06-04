import * as ACTIONS from './actionTypes';


export const initialState = {
  definitions: {},
  loading: false,
  error: null,
};

export const addSystems = (definitions, listing) => {
  // Append listing results to existing definitions, generate new object
  const result = { ...definitions };
  listing.forEach((system) => {
    result[system.id] = { ...system };
  });
  return result;
};

export function systems(state = initialState, action) {
  switch (action.type) {
    case ACTIONS.TAPIS_SYSTEMS_LIST_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case ACTIONS.TAPIS_SYSTEMS_LIST_SUCCESS:
      return {
        ...state,
        definitions: addSystems(state.definitions, action.payload.result),
        loading: false,
        error: null,
      };
    case ACTIONS.TAPIS_SYSTEMS_LIST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
}
