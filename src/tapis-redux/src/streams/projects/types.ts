import * as Streams from "@tapis/tapis-typescript-streams";
import { ApiCallback, TapisListResults } from 'tapis-redux/types';
import * as ACTIONS from './actionTypes';

export type ProjectsReducerState = {
  projects: TapisListResults<Streams.Project>
}

export interface ProjectsListingRequestPayload {
  // Original request parameters
  params: Streams.ListProjectsRequest
}

export type ProjectsListingSuccessPayload = {
  incoming: Array<Streams.Project>
} & ProjectsListingRequestPayload;

export type ProjectsListingFailurePayload = {
  error: Error
} & ProjectsListingRequestPayload;

export type ProjectsListingRequest = {
  type: typeof ACTIONS.TAPIS_PROJECTS_LIST_REQUEST;
  payload: ProjectsListingRequestPayload;
}

export type ProjectsListingSuccess = {
  type: typeof ACTIONS.TAPIS_PROJECTS_LIST_SUCCESS;
  payload: ProjectsListingSuccessPayload;
}

export type ProjectsListingFailure = {
  type: typeof ACTIONS.TAPIS_PROJECTS_LIST_FAILURE;
  payload: ProjectsListingFailurePayload
}

export type ProjectsListingAction = 
  | ProjectsListingRequest
  | ProjectsListingSuccess
  | ProjectsListingFailure;


export type ProjectsListCallback = ApiCallback<Streams.RespListProjects>;
