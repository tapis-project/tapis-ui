import * as Streams from "@tapis/tapis-typescript-streams";
import { ApiCallback, TapisListResults } from 'tapis-redux/types';
import * as ACTIONS from './actionTypes';

export type MeasurementsReducerState = {
  measurements: TapisListResults<Streams.Measurement>
}

export interface MeasurementsListingRequestPayload {
  // Original request parameters
  params: Streams.ListMeasurementsRequest
}

export type MeasurementsListingSuccessPayload = {
  incoming: Array<Streams.Measurement>
} & MeasurementsListingRequestPayload;

export type MeasurementsListingFailurePayload = {
  error: Error
} & MeasurementsListingRequestPayload;

export type MeasurementsListingRequest = {
  type: typeof ACTIONS.TAPIS_MEASUREMENTS_LIST_REQUEST;
  payload: MeasurementsListingRequestPayload;
}

export type MeasurementsListingSuccess = {
  type: typeof ACTIONS.TAPIS_MEASUREMENTS_LIST_SUCCESS;
  payload: MeasurementsListingSuccessPayload;
}

export type MeasurementsListingFailure = {
  type: typeof ACTIONS.TAPIS_MEASUREMENTS_LIST_FAILURE;
  payload: MeasurementsListingFailurePayload
}

export type MeasurementsListingAction = 
  | MeasurementsListingRequest
  | MeasurementsListingSuccess
  | MeasurementsListingFailure;


export type MeasurementsListCallback = ApiCallback<Streams.RespListMeasurements>;
