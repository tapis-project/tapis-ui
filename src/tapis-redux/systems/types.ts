import { Systems } from '@tapis/tapis-typescript';
import { ApiCallback, TapisListResults } from 'tapis-redux/types';
import * as ACTIONS from './actionTypes';

export type SystemsReducerState = {
  systems: TapisListResults<Systems.TapisSystem>
}

export interface SystemsListingRequestPayload {
  // Original request parameters
  params: Systems.GetSystemsRequest
}

export type SystemsListingSuccessPayload = {
  incoming: Array<Systems.TapisSystem>
} & SystemsListingRequestPayload;

export type SystemsListingFailurePayload = {
  error: Error
} & SystemsListingRequestPayload;

export type SystemsListingRequest = {
  type: typeof ACTIONS.TAPIS_SYSTEMS_LIST_REQUEST;
  payload: SystemsListingRequestPayload;
}

export type SystemsListingSuccess = {
  type: typeof ACTIONS.TAPIS_SYSTEMS_LIST_SUCCESS;
  payload: SystemsListingSuccessPayload;
}

export type SystemsListingFailure = {
  type: typeof ACTIONS.TAPIS_SYSTEMS_LIST_FAILURE;
  payload: SystemsListingFailurePayload
}

export type SystemsListingAction = 
  | SystemsListingRequest
  | SystemsListingSuccess
  | SystemsListingFailure;


export type SystemsListCallback = ApiCallback<Systems.RespSystems>;
