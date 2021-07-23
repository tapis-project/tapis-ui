import {
  SitesReducerState,
  SitesListingRequestPayload,
  SitesListingSuccessPayload,
  SitesListingFailurePayload,
  SitesListingAction
} from './types';
import {
  getEmptyListResults,
  updateList,
  setRequesting,
  setFailure
} from 'tapis-redux/types/results'
import { TAPIS_DEFAULT_SITES_LISTING_LIMIT } from 'tapis-redux/constants/tapis';
import * as ACTIONS from './actionTypes';
import { Streams } from "@tapis/tapis-typescript";


const emptyResults = getEmptyListResults(TAPIS_DEFAULT_SITES_LISTING_LIMIT);

export const initialState: SitesReducerState = {};

const sitesMapCheck = (sites: SitesReducerState, projectId: string): SitesReducerState => {
  const result: SitesReducerState = {...sites};
  if(!(projectId in result)) {
    result[projectId] = {...emptyResults}
  }
  return result;
}

const setListingRequest = (sites: SitesReducerState, payload: SitesListingRequestPayload): SitesReducerState => {
  const { projectUuid } = payload.params;
  const result = sitesMapCheck(sites, projectUuid);
  result[projectUuid] = setRequesting<Streams.Site>(result[projectUuid]);
  return result;
} 

const setListingSuccess = (sites: SitesReducerState, payload: SitesListingSuccessPayload): SitesReducerState => {
  const { projectUuid, offset, limit } = payload.params;
  const { incoming } = payload;
  const result: SitesReducerState = sitesMapCheck(sites, projectUuid);
  result[projectUuid] = updateList<Streams.Site>(result[projectUuid], incoming, offset, limit, TAPIS_DEFAULT_SITES_LISTING_LIMIT);
  return result;
}

const setListingFailure = (sites: SitesReducerState, payload: SitesListingFailurePayload): SitesReducerState => {
  const { projectUuid } = payload.params;
  const { error } = payload;
  const result: SitesReducerState = sitesMapCheck(sites, projectUuid);
  result[projectUuid] = setFailure<Streams.Site>(result[projectUuid], error);
  return result;
}

export function sites(state: SitesReducerState = initialState, action: SitesListingAction): SitesReducerState {
  switch (action.type) {
    case ACTIONS.TAPIS_SITES_LIST_REQUEST:
      return {
        ...state,
        ...setListingRequest(state, action.payload)
      };
    case ACTIONS.TAPIS_SITES_LIST_SUCCESS:
      return {
        ...state,
        ...setListingSuccess(state, action.payload)
      };
    case ACTIONS.TAPIS_SITES_LIST_FAILURE:
      return {
        ...state,
        ...setListingFailure(state, action.payload)
      };
    default:
      return state;
  }
}
