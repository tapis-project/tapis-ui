import { Systems } from '@tapis/tapis-typescript';
import { ApiCallback, TapisListResults } from 'tapis-redux/types';
import * as ACTIONS from './actionTypes';
export declare type SystemsReducerState = {
    systems: TapisListResults<Systems.TapisSystem>;
};
export interface SystemsListingRequestPayload {
    params: Systems.GetSystemsRequest;
}
export declare type SystemsListingSuccessPayload = {
    incoming: Array<Systems.TapisSystem>;
} & SystemsListingRequestPayload;
export declare type SystemsListingFailurePayload = {
    error: Error;
} & SystemsListingRequestPayload;
export declare type SystemsListingRequest = {
    type: typeof ACTIONS.TAPIS_SYSTEMS_LIST_REQUEST;
    payload: SystemsListingRequestPayload;
};
export declare type SystemsListingSuccess = {
    type: typeof ACTIONS.TAPIS_SYSTEMS_LIST_SUCCESS;
    payload: SystemsListingSuccessPayload;
};
export declare type SystemsListingFailure = {
    type: typeof ACTIONS.TAPIS_SYSTEMS_LIST_FAILURE;
    payload: SystemsListingFailurePayload;
};
export declare type SystemsListingAction = SystemsListingRequest | SystemsListingSuccess | SystemsListingFailure;
export declare type SystemsListCallback = ApiCallback<Systems.RespSystems>;
