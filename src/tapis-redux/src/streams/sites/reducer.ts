import {
  SitesReducerState,
  SitesListingRequestPayload,
  SitesListingSuccessPayload,
  SitesListingFailurePayload,
  SitesListingAction,
  ProjectMap
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

export const initialState: SitesReducerState = {
  siteMap: {},
  selected: null
};

const sitesMapCheck = (sites: ProjectMap, projectId: string): ProjectMap => {
  const result: ProjectMap = {...sites};
  if(!(projectId in result)) {
    result[projectId] = {...emptyResults}
  }
  return result;
}

const setListingRequest = (sites: ProjectMap, payload: SitesListingRequestPayload): ProjectMap => {
  const { projectUuid } = payload.params;
  const result: ProjectMap = sitesMapCheck(sites, projectUuid);
  result[projectUuid] = setRequesting<Streams.Site>(result[projectUuid]);
  return result;
} 

const setListingSuccess = (sites: ProjectMap, payload: SitesListingSuccessPayload): ProjectMap => {
  const { projectUuid, offset, limit } = payload.params;
  const { incoming } = payload;
  const result: ProjectMap = sitesMapCheck(sites, projectUuid);
  result[projectUuid] = updateList<Streams.Site>(result[projectUuid], incoming, offset, limit, TAPIS_DEFAULT_SITES_LISTING_LIMIT);
  return result;
}

const setListingFailure = (sites: ProjectMap, payload: SitesListingFailurePayload): ProjectMap => {
  const { projectUuid } = payload.params;
  const { error } = payload;
  const result: ProjectMap = sitesMapCheck(sites, projectUuid);
  result[projectUuid] = setFailure<Streams.Site>(result[projectUuid], error);
  return result;
}

export function sites(state: SitesReducerState = initialState, action: SitesListingAction): SitesReducerState {
  switch (action.type) {
    case ACTIONS.TAPIS_SITES_LIST_REQUEST: {
      return {
        siteMap: {
          ...state.siteMap,
          ...setListingRequest(state.siteMap, action.payload)
        },
        selected: state.selected
      };
    }
    case ACTIONS.TAPIS_SITES_LIST_SUCCESS: {
      return {
        siteMap: {
          ...state.siteMap,
          ...setListingSuccess(state.siteMap, action.payload)
        },
        selected: state.selected
      };
    }
    case ACTIONS.TAPIS_SITES_LIST_FAILURE: {
      return {
        siteMap: {
          ...state.siteMap,
          ...setListingFailure(state.siteMap, action.payload)
        },
        selected: state.selected
      };
    }
    case ACTIONS.TAPIS_SELECT_SITE: {
      return {
        siteMap: state.siteMap,
        selected: action.payload
      }
    }
    default:
      return state;
  }
}
