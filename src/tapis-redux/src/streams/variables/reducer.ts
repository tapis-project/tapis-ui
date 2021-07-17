import {
  VariablesReducerState,
  VariablesListingRequestPayload,
  VariablesListingSuccessPayload,
  VariablesListingFailurePayload
} from './types';
import {
  updateList,
  setRequesting,
  setFailure,
  getEmptyListResults,
  TapisListResults
} from 'tapis-redux/types/results'
import { TAPIS_DEFAULT_VARIABLES_LISTING_LIMIT } from 'tapis-redux/constants/tapis';
import * as ACTIONS from './actionTypes';
import { Streams } from "@tapis/tapis-typescript";


const emptyResults = getEmptyListResults(TAPIS_DEFAULT_VARIABLES_LISTING_LIMIT);

export const initialState: VariablesReducerState = {
  variables: { ...emptyResults }
};

const setListingRequest = (variables: TapisListResults<Streams.Variable>,
  payload: VariablesListingRequestPayload): TapisListResults<Streams.Variable> => {
  const result = setRequesting(variables);
  return result;
} 

const setListingSuccess = (variables: TapisListResults<Streams.Variable>,
  payload: VariablesListingSuccessPayload): TapisListResults<Streams.Variable> => {
  // TODO: Handle different combinations of skip and startAfter requests
  const result = updateList(variables, payload.incoming, 0, 
    payload.params.limit, TAPIS_DEFAULT_VARIABLES_LISTING_LIMIT);
  return result;
}

const setListingFailure = (variables: TapisListResults<Streams.Variable>,
  payload: VariablesListingFailurePayload): TapisListResults<Streams.Variable> => {
  const result = setFailure(variables, payload.error);
  return result;
}

export function variables(state: VariablesReducerState = initialState, action): VariablesReducerState {
  switch (action.type) {
    case ACTIONS.TAPIS_VARIABLES_LIST_REQUEST:
      return {
        ...state,
        variables: setListingRequest(state.variables, action.payload)
      };
    case ACTIONS.TAPIS_VARIABLES_LIST_SUCCESS:
      return {
        ...state,
        variables: setListingSuccess(state.variables, action.payload)
      };
    case ACTIONS.TAPIS_VARIABLES_LIST_FAILURE:
      return {
        ...state,
        variables: setListingFailure(state.variables, action.payload)
      };
    default:
      return state;
  }
}
