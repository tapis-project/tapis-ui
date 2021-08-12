import { Apps } from '@tapis/tapis-typescript';
import { ApiCallback } from 'tapis-redux/src/types';
import * as ACTIONS from './actionTypes';

export interface AppsListingRequestPayload {
  // Original request parameters
  params: Apps.GetAppsRequest
}

export type AppsListingSuccessPayload = {
  incoming: Array<Apps.TapisApp>
} & AppsListingRequestPayload;

export type AppsListingFailurePayload = {
  error: Error
} & AppsListingRequestPayload;

export type AppsListingRequest = {
  type: typeof ACTIONS.TAPIS_APPS_LIST_REQUEST;
  payload: AppsListingRequestPayload;
}

export type AppsListingSuccess = {
  type: typeof ACTIONS.TAPIS_APPS_LIST_SUCCESS;
  payload: AppsListingSuccessPayload;
}

export type AppsListingFailure = {
  type: typeof ACTIONS.TAPIS_APPS_LIST_FAILURE;
  payload: AppsListingFailurePayload
}

export type AppsListingAction = 
  | AppsListingRequest
  | AppsListingSuccess
  | AppsListingFailure;


export type AppsListCallback = ApiCallback<Apps.RespApps>;
