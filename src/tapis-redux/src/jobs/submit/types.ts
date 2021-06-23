import { Jobs } from '@tapis/tapis-typescript';
import { ApiCallback } from 'tapis-redux/types';
import * as ACTIONS from './actionTypes';


export type JobsSubmitState = {
  loading: boolean,
  error: Error,
  result: Jobs.Job
}

export interface JobsSubmitRequestPayload {
}

export type JobsSubmitSuccessPayload = {
  result: Jobs.Job
} & JobsSubmitRequestPayload;

export type JobsSubmitFailurePayload = {
  error: Error
} & JobsSubmitRequestPayload;

export type JobsSubmitRequest = {
  type: typeof ACTIONS.TAPIS_JOBS_SUBMIT_REQUEST;
  payload: JobsSubmitRequestPayload;
}

export type JobsSubmitSuccess = {
  type: typeof ACTIONS.TAPIS_JOBS_SUBMIT_SUCCESS;
  payload: JobsSubmitSuccessPayload;
}

export type JobsSubmitFailure = {
  type: typeof ACTIONS.TAPIS_JOBS_SUBMIT_FAILURE;
  payload: JobsSubmitFailurePayload
}

export type JobsSubmitAction = 
  | JobsSubmitRequest
  | JobsSubmitSuccess
  | JobsSubmitFailure;


export type JobsSubmitCallback = ApiCallback<Jobs.RespSubmitJob>;
