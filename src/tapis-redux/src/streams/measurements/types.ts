import { Streams } from "@tapis/tapis-typescript";
import { ApiCallback, TapisListResults } from 'tapis-redux/types';
import * as ACTIONS from './actionTypes';


export type MeasurementList = TapisListResults<Streams.Measurement>;

export type InstrumentMap = {
  [ instrumentId: string ]: MeasurementList
}

export type MeasurementsReducerState = {
  measurementMap: InstrumentMap,
  selected: Streams.Measurement
}

export interface VariableMeasurmentListing {
  [datetime: string]: number
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

export type MeasurementSelect = {
  type: typeof ACTIONS.TAPIS_SELECT_MEASUREMENT,
  payload: Streams.Measurement
}

export type MeasurementsListingAction = 
  | MeasurementsListingRequest
  | MeasurementsListingSuccess
  | MeasurementsListingFailure
  | MeasurementSelect;


export type MeasurementsListCallback = ApiCallback<Streams.RespListMeasurements>;
