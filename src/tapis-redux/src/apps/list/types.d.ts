import { Apps } from '@tapis/tapis-typescript';
import { ApiCallback } from 'tapis-redux/types';
import * as ACTIONS from './actionTypes';
export interface AppsListingRequestPayload {
    params: Apps.GetAppsRequest;
}
export declare type AppsListingSuccessPayload = {
    incoming: Array<Apps.TapisApp>;
} & AppsListingRequestPayload;
export declare type AppsListingFailurePayload = {
    error: Error;
} & AppsListingRequestPayload;
export declare type AppsListingRequest = {
    type: typeof ACTIONS.TAPIS_APPS_LIST_REQUEST;
    payload: AppsListingRequestPayload;
};
export declare type AppsListingSuccess = {
    type: typeof ACTIONS.TAPIS_APPS_LIST_SUCCESS;
    payload: AppsListingSuccessPayload;
};
export declare type AppsListingFailure = {
    type: typeof ACTIONS.TAPIS_APPS_LIST_FAILURE;
    payload: AppsListingFailurePayload;
};
export declare type AppsListingAction = AppsListingRequest | AppsListingSuccess | AppsListingFailure;
export declare type AppsListCallback = ApiCallback<Apps.RespApps>;
