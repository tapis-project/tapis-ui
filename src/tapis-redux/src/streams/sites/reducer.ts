import {
  SitesReducerState,
  SitesListingRequestPayload,
  SitesListingSuccessPayload,
  SitesListingFailurePayload
} from './types';
import {
  updateList,
  setRequesting,
  setFailure,
  getEmptyListResults,
  TapisListResults
} from 'tapis-redux/types/results'
import { TAPIS_DEFAULT_SITES_LISTING_LIMIT } from 'tapis-redux/constants/tapis';
import * as ACTIONS from './actionTypes';
import { Streams } from "@tapis/tapis-typescript";


const emptyResults = getEmptyListResults(TAPIS_DEFAULT_SITES_LISTING_LIMIT);

export const initialState: SitesReducerState = {
  sites: { ...emptyResults }
};

const setListingRequest = (sites: TapisListResults<Streams.Site>,
  payload: SitesListingRequestPayload): TapisListResults<Streams.Site> => {
  const result = setRequesting(sites);
  return result;
} 

const setListingSuccess = (sites: TapisListResults<Streams.Site>,
  payload: SitesListingSuccessPayload): TapisListResults<Streams.Site> => {
  // TODO: Handle different combinations of skip and startAfter requests
  const result = updateList(sites, payload.incoming, 0, 
    payload.params.limit, TAPIS_DEFAULT_SITES_LISTING_LIMIT);
  return result;
}

const setListingFailure = (sites: TapisListResults<Streams.Site>,
  payload: SitesListingFailurePayload): TapisListResults<Streams.Site> => {
  const result = setFailure(sites, payload.error);
  return result;
}

export function sites(state: SitesReducerState = initialState, action): SitesReducerState {
  switch (action.type) {
    case ACTIONS.TAPIS_SITES_LIST_REQUEST:
      return {
        ...state,
        sites: setListingRequest(state.sites, action.payload)
      };
    case ACTIONS.TAPIS_SITES_LIST_SUCCESS:
      return {
        ...state,
        sites: setListingSuccess(state.sites, action.payload)
      };
    case ACTIONS.TAPIS_SITES_LIST_FAILURE:
      return {
        ...state,
        sites: setListingFailure(state.sites, action.payload)
      };
    default:
      return state;
  }
}
