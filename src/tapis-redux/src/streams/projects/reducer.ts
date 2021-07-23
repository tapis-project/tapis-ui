import {
  ProjectsReducerState,
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
import { Streams } from "@tapis/tapis-typescript";


export const initialState: TapisListResults<Streams.Project> = getEmptyListResults(TAPIS_DEFAULT_PROJECTS_LISTING_LIMIT);

const setListingRequest = (projects: TapisListResults<Streams.Project>): TapisListResults<Streams.Project> => {
  const result = setRequesting<Streams.Project>(projects);
  return result;
} 

const setListingSuccess = (projects: TapisListResults<Streams.Project>,
  payload: ProjectsListingSuccessPayload): TapisListResults<Streams.Project> => {
  // TODO: Handle different combinations of skip and startAfter requests
  const result = updateList<Streams.Project>(projects, payload.incoming, 0, 
    payload.params.limit, TAPIS_DEFAULT_PROJECTS_LISTING_LIMIT);
  return result;
}

const setListingFailure = (projects: TapisListResults<Streams.Project>,
  payload: ProjectsListingFailurePayload): TapisListResults<Streams.Project> => {
  const result = setFailure<Streams.Project>(projects, payload.error);
  return result;
}

export function projects(state: ProjectsReducerState = initialState, action): ProjectsReducerState {
  switch (action.type) {
    case ACTIONS.TAPIS_PROJECTS_LIST_REQUEST:
      return setListingRequest(state);
    case ACTIONS.TAPIS_PROJECTS_LIST_SUCCESS:
      console.log(state);
      return setListingSuccess(state, action.payload);
    case ACTIONS.TAPIS_PROJECTS_LIST_FAILURE:
      return setListingFailure(state, action.payload);
    default:
      return state;
  }
}
