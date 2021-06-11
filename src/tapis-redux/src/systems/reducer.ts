import {
  SystemsReducerState,
  SystemsListingRequestPayload,
  SystemsListingSuccessPayload,
  SystemsListingFailurePayload
} from './types';
import {
  updateList,
  setRequesting,
  setFailure,
  getEmptyListResults,
  TapisListResults
} from 'tapis-redux/types/results'
import { TAPIS_DEFAULT_SYSTEMS_LISTING_LIMIT } from 'tapis-redux/constants/tapis';
import * as ACTIONS from './actionTypes';
import { Systems } from '@tapis/tapis-typescript';


const emptyResults = getEmptyListResults(TAPIS_DEFAULT_SYSTEMS_LISTING_LIMIT);

export const initialState: SystemsReducerState = {
  systems: { ...emptyResults }
};

const setListingRequest = (systems: TapisListResults<Systems.TapisSystem>,
  payload: SystemsListingRequestPayload): TapisListResults<Systems.TapisSystem> => {
  const result = setRequesting(systems);
  return result;
} 

const setListingSuccess = (systems: TapisListResults<Systems.TapisSystem>,
  payload: SystemsListingSuccessPayload): TapisListResults<Systems.TapisSystem> => {
  // TODO: Handle different combinations of skip and startAfter requests
  const result = updateList(systems, payload.incoming, payload.params.skip, 
    payload.params.limit, TAPIS_DEFAULT_SYSTEMS_LISTING_LIMIT);
  return result;
}

const setListingFailure = (systems: TapisListResults<Systems.TapisSystem>,
  payload: SystemsListingFailurePayload): TapisListResults<Systems.TapisSystem> => {
  const result = setFailure(systems, payload.error);
  return result;
}

export function systems(state: SystemsReducerState = initialState, action): SystemsReducerState {
  switch (action.type) {
    case ACTIONS.TAPIS_SYSTEMS_LIST_REQUEST:
      return {
        ...state,
        systems: setListingRequest(state.systems, action.payload)
      };
    case ACTIONS.TAPIS_SYSTEMS_LIST_SUCCESS:
      return {
        ...state,
        systems: setListingSuccess(state.systems, action.payload)
      };
    case ACTIONS.TAPIS_SYSTEMS_LIST_FAILURE:
      return {
        ...state,
        systems: setListingFailure(state.systems, action.payload)
      };
    default:
      return state;
  }
}
