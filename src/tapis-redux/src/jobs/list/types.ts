import { Jobs } from '@tapis/tapis-typescript';
import { ApiCallback } from 'tapis-redux/types';
import * as ACTIONS from './actionTypes';


export interface JobsListingRequestPayload {
  // Original request parameters
  params: Jobs.GetJobListRequest
}

export type JobsListingSuccessPayload = {
  incoming: Array<Jobs.JobListDTO>
} & JobsListingRequestPayload;

export type JobsListingFailurePayload = {
  error: Error
} & JobsListingRequestPayload;

export type JobsListingRequest = {
  type: typeof ACTIONS.TAPIS_JOBS_LIST_REQUEST;
  payload: JobsListingRequestPayload;
}

export type JobsListingSuccess = {
  type: typeof ACTIONS.TAPIS_JOBS_LIST_SUCCESS;
  payload: JobsListingSuccessPayload;
}

export type JobsListingFailure = {
  type: typeof ACTIONS.TAPIS_JOBS_LIST_FAILURE;
  payload: JobsListingFailurePayload
}

export type JobsListingAction = 
  | JobsListingRequest
  | JobsListingSuccess
  | JobsListingFailure;


export type JobsListCallback = ApiCallback<Jobs.RespGetJobList>;
