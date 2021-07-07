import { Jobs } from '@tapis/tapis-typescript';
import { ApiCallback } from 'tapis-redux/types';
import * as ACTIONS from './actionTypes';
export declare type JobsSubmitState = {
    loading: boolean;
    error: Error;
    result: Jobs.Job;
};
export interface JobsSubmitRequestPayload {
}
export declare type JobsSubmitSuccessPayload = {
    result: Jobs.Job;
} & JobsSubmitRequestPayload;
export declare type JobsSubmitFailurePayload = {
    error: Error;
} & JobsSubmitRequestPayload;
export declare type JobsSubmitResetPayload = {};
export declare type JobsSubmitRequest = {
    type: typeof ACTIONS.TAPIS_JOBS_SUBMIT_REQUEST;
    payload: JobsSubmitRequestPayload;
};
export declare type JobsSubmitSuccess = {
    type: typeof ACTIONS.TAPIS_JOBS_SUBMIT_SUCCESS;
    payload: JobsSubmitSuccessPayload;
};
export declare type JobsSubmitFailure = {
    type: typeof ACTIONS.TAPIS_JOBS_SUBMIT_FAILURE;
    payload: JobsSubmitFailurePayload;
};
export declare type JobsSubmitReset = {
    type: typeof ACTIONS.TAPIS_JOBS_SUBMIT_RESET;
    payload: JobsSubmitResetPayload;
};
export declare type JobsSubmitAction = JobsSubmitRequest | JobsSubmitSuccess | JobsSubmitFailure | JobsSubmitReset;
export declare type JobsSubmitCallback = ApiCallback<Jobs.RespSubmitJob>;
