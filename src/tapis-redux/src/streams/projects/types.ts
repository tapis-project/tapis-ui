import { Streams } from "@tapis/tapis-typescript";
import { ApiCallback, TapisListResults } from 'tapis-redux/types';
import * as ACTIONS from './actionTypes';

export type ProjectList = TapisListResults<Streams.Project>;

export type ProjectsReducerState = {
  projects: ProjectList,
  selected: Streams.Project
};


export interface ProjectsListingRequestPayload {
  // Original request parameters
  params: Streams.ListProjectsRequest
};

export type ProjectsListingSuccessPayload = {
  incoming: Array<Streams.Project>
} & ProjectsListingRequestPayload;

export type ProjectsListingFailurePayload = {
  error: Error
} & ProjectsListingRequestPayload;

export type ProjectsListingRequest = {
  type: typeof ACTIONS.TAPIS_PROJECTS_LIST_REQUEST,
  payload: ProjectsListingRequestPayload;
}

export type ProjectsListingSuccess = {
  type: typeof ACTIONS.TAPIS_PROJECTS_LIST_SUCCESS,
  payload: ProjectsListingSuccessPayload;
}

export type ProjectsListingFailure = {
  type: typeof ACTIONS.TAPIS_PROJECTS_LIST_FAILURE,
  payload: ProjectsListingFailurePayload
}

export type ProjectSelect = {
  type: typeof ACTIONS.TAPIS_SELECT_PROJECT,
  payload: Streams.Project
}

export type ProjectsListingAction = 
  | ProjectsListingRequest
  | ProjectsListingSuccess
  | ProjectsListingFailure
  | ProjectSelect;


export type ProjectsListCallback = ApiCallback<Streams.RespListProjects>;