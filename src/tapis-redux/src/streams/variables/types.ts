import * as Streams from "@tapis/tapis-typescript-streams";
import { ApiCallback, TapisListResults } from 'tapis-redux/types';
import * as ACTIONS from './actionTypes';

export type VariablesReducerState = {
  variables: TapisListResults<Streams.Variable>
}

export interface VariablesListingRequestPayload {
  // Original request parameters
  params: Streams.ListVariablesRequest
}

export type VariablesListingSuccessPayload = {
  incoming: Array<Streams.Variable>
} & VariablesListingRequestPayload;

export type VariablesListingFailurePayload = {
  error: Error
} & VariablesListingRequestPayload;

export type VariablesListingRequest = {
  type: typeof ACTIONS.TAPIS_VARIABLES_LIST_REQUEST;
  payload: VariablesListingRequestPayload;
}

export type VariablesListingSuccess = {
  type: typeof ACTIONS.TAPIS_VARIABLES_LIST_SUCCESS;
  payload: VariablesListingSuccessPayload;
}

export type VariablesListingFailure = {
  type: typeof ACTIONS.TAPIS_VARIABLES_LIST_FAILURE;
  payload: VariablesListingFailurePayload
}

export type VariablesListingAction = 
  | VariablesListingRequest
  | VariablesListingSuccess
  | VariablesListingFailure;


export type VariablesListCallback = ApiCallback<Streams.RespListVariables>;
