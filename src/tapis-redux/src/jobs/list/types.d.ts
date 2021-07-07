import { Jobs } from '@tapis/tapis-typescript';
import { ApiCallback } from 'tapis-redux/types';
import * as ACTIONS from './actionTypes';
export interface JobsListingRequestPayload {
    params: Jobs.GetJobListRequest;
}
export declare type JobsListingSuccessPayload = {
    incoming: Array<Jobs.JobListDTO>;
} & JobsListingRequestPayload;
export declare type JobsListingFailurePayload = {
    error: Error;
} & JobsListingRequestPayload;
export declare type JobsListingRequest = {
    type: typeof ACTIONS.TAPIS_JOBS_LIST_REQUEST;
    payload: JobsListingRequestPayload;
};
export declare type JobsListingSuccess = {
    type: typeof ACTIONS.TAPIS_JOBS_LIST_SUCCESS;
    payload: JobsListingSuccessPayload;
};
export declare type JobsListingFailure = {
    type: typeof ACTIONS.TAPIS_JOBS_LIST_FAILURE;
    payload: JobsListingFailurePayload;
};
export declare type JobsListingAction = JobsListingRequest | JobsListingSuccess | JobsListingFailure;
export declare type JobsListCallback = ApiCallback<Jobs.RespGetJobList>;
