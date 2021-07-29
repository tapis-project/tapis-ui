import { Streams } from "@tapis/tapis-typescript";
import { ApiCallback, TapisListResults } from 'tapis-redux/types';
import * as ACTIONS from './actionTypes';

export type VariableList = TapisListResults<Streams.Variable>;

export type InstrumentMap = {
  [ instrumentId: string ]: VariableList
}

export type SiteMap = {
  [ siteId: string ]: InstrumentMap
}

export type ProjectMap = {
  [ projectId: string ]: SiteMap
}

export type VariablesReducerState = {
  variableMap: ProjectMap,
  selected: Streams.Variable
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
  type: typeof ACTIONS.TAPIS_VARIABLES_LIST_REQUEST,
  payload: VariablesListingRequestPayload;
}

export type VariablesListingSuccess = {
  type: typeof ACTIONS.TAPIS_VARIABLES_LIST_SUCCESS,
  payload: VariablesListingSuccessPayload;
}

export type VariablesListingFailure = {
  type: typeof ACTIONS.TAPIS_VARIABLES_LIST_FAILURE,
  payload: VariablesListingFailurePayload
}

export type VariableSelect = {
  type: typeof ACTIONS.TAPIS_SELECT_VARIABLE,
  payload: Streams.Variable
}

export type VariablesListingAction = 
  | VariablesListingRequest
  | VariablesListingSuccess
  | VariablesListingFailure
  | VariableSelect;


export type VariablesListCallback = ApiCallback<Streams.RespListVariables>;
