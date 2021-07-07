import {
  ProjectsReducerState,
  ProjectsListingRequestPayload,
  ProjectsListingSuccessPayload,
  ProjectsListingFailurePayload
} from './types';
import {
  updateList,
  setRequesting,
  setFailure,
  getEmptyListResults,
  TapisListResults
} from 'tapis-redux/types/results'
import { TAPIS_DEFAULT_PROJECTS_LISTING_LIMIT } from 'tapis-redux/constants/tapis';
import * as ACTIONS from './actionTypes';
import * as Streams from "@tapis/tapis-typescript-streams";


const emptyResults = getEmptyListResults(TAPIS_DEFAULT_PROJECTS_LISTING_LIMIT);

export const initialState: ProjectsReducerState = {
  projects: { ...emptyResults }
};

const setListingRequest = (projects: TapisListResults<Streams.Project>,
  payload: ProjectsListingRequestPayload): TapisListResults<Streams.Project> => {
  const result = setRequesting(projects);
  return result;
} 

const setListingSuccess = (projects: TapisListResults<Streams.Project>,
  payload: ProjectsListingSuccessPayload): TapisListResults<Streams.Project> => {
  // TODO: Handle different combinations of skip and startAfter requests
  const result = updateList(projects, payload.incoming, 0, 
    payload.params.limit, TAPIS_DEFAULT_PROJECTS_LISTING_LIMIT);
  return result;
}

const setListingFailure = (projects: TapisListResults<Streams.Project>,
  payload: ProjectsListingFailurePayload): TapisListResults<Streams.Project> => {
  const result = setFailure(projects, payload.error);
  return result;
}

export function projects(state: ProjectsReducerState = initialState, action): ProjectsReducerState {
  switch (action.type) {
    case ACTIONS.TAPIS_PROJECTS_LIST_REQUEST:
      return {
        ...state,
        projects: setListingRequest(state.projects, action.payload)
      };
    case ACTIONS.TAPIS_PROJECTS_LIST_SUCCESS:
      return {
        ...state,
        projects: setListingSuccess(state.projects, action.payload)
      };
    case ACTIONS.TAPIS_PROJECTS_LIST_FAILURE:
      return {
        ...state,
        projects: setListingFailure(state.projects, action.payload)
      };
    default:
      return state;
  }
}
