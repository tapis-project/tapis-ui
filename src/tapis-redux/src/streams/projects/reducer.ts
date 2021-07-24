import {
  ProjectsReducerState,
  ProjectsListingSuccessPayload,
  ProjectsListingFailurePayload,
  ProjectsListingAction,
  ProjectList
} from './types';
import {
  updateList,
  setRequesting,
  setFailure,
  getEmptyListResults
} from 'tapis-redux/types/results'
import { TAPIS_DEFAULT_PROJECTS_LISTING_LIMIT } from 'tapis-redux/constants/tapis';
import * as ACTIONS from './actionTypes';
import { Streams } from "@tapis/tapis-typescript";


export const initialState: ProjectsReducerState = {
  projects: getEmptyListResults(TAPIS_DEFAULT_PROJECTS_LISTING_LIMIT),
  selected: null
};

const setListingRequest = (projects: ProjectList): ProjectList => {
  const result = setRequesting<Streams.Project>(projects);
  return result;
} 

const setListingSuccess = (projects: ProjectList,
  payload: ProjectsListingSuccessPayload): ProjectList => {
  const result = updateList<Streams.Project>(projects, payload.incoming, 0, payload.params.limit, TAPIS_DEFAULT_PROJECTS_LISTING_LIMIT);
  return result;
}

const setListingFailure = (projects: ProjectList,
  payload: ProjectsListingFailurePayload): ProjectList => {
  const result = setFailure<Streams.Project>(projects, payload.error);
  return result;
}

export function projects(state: ProjectsReducerState = initialState, action: ProjectsListingAction): ProjectsReducerState {
  //DISPATCH DISPATCHES AN ACTION, THE ACTUAL API REQUESTS ARE MADE IN THE ABOVE FUNCTIONS BASED ON THE ACTION PAYLOAD
  console.log(action);
  switch (action.type) {
    case ACTIONS.TAPIS_PROJECTS_LIST_REQUEST: {
      return {
        projects: setListingRequest(state.projects),
        selected: state.selected
      };
    }
    case ACTIONS.TAPIS_PROJECTS_LIST_SUCCESS: {
      return {
        projects: setListingSuccess(state.projects, action.payload),
        selected: state.selected
      };
    }
    case ACTIONS.TAPIS_PROJECTS_LIST_FAILURE:
      return {
        projects: setListingFailure(state.projects, action.payload),
        selected: state.selected
      };
    case ACTIONS.TAPIS_SELECT_PROJECT: {
      return {
        projects: state.projects,
        selected: action.payload
      }
    }
    default:
      return state;
  }
}
