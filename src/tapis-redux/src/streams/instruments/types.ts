import { Streams } from "@tapis/tapis-typescript";
import { ApiCallback, TapisListResults } from 'tapis-redux/types';
import * as ACTIONS from './actionTypes';

export type InstrumentList = TapisListResults<Streams.Instrument>;

export type SiteMap = {
  [ siteId: string ]: InstrumentList
}

export type ProjectMap = {
  [ projectId: string ]: SiteMap
}

export type InstrumentsReducerState = {
  instrumentMap: ProjectMap,
  selected: Streams.Instrument
}



export interface InstrumentsListingRequestPayload {
  // Original request parameters
  params: Streams.ListInstrumentsRequest
}

export type InstrumentsListingSuccessPayload = {
  incoming: Array<Streams.Instrument>
} & InstrumentsListingRequestPayload;

export type InstrumentsListingFailurePayload = {
  error: Error
} & InstrumentsListingRequestPayload;

export type InstrumentsListingRequest = {
  type: typeof ACTIONS.TAPIS_INSTRUMENTS_LIST_REQUEST,
  payload: InstrumentsListingRequestPayload
}

export type InstrumentsListingSuccess = {
  type: typeof ACTIONS.TAPIS_INSTRUMENTS_LIST_SUCCESS,
  payload: InstrumentsListingSuccessPayload
}

export type InstrumentsListingFailure = {
  type: typeof ACTIONS.TAPIS_INSTRUMENTS_LIST_FAILURE,
  payload: InstrumentsListingFailurePayload
}

export type InstrumentSelect = {
  type: typeof ACTIONS.TAPIS_SELECT_INSTRUMENT,
  payload: Streams.Instrument
}

export type InstrumentsListingAction = 
  | InstrumentsListingRequest
  | InstrumentsListingSuccess
  | InstrumentsListingFailure
  | InstrumentSelect;


export type InstrumentsListCallback = ApiCallback<Streams.RespListInstruments>;
