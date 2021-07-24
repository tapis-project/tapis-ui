import { Streams } from "@tapis/tapis-typescript";
import { ApiCallback, TapisListResults } from 'tapis-redux/types';
import * as ACTIONS from './actionTypes';

// export type InstrumentList = TapisListResults<Streams.Instrument>;

// export type SiteMap = {
//   [ siteId: string ]: InstrumentList
// }

// export type ProjectMap = {
//   [ projectId: string ]: SiteMap
// }

// export type InstrumentsReducerState = {
//   state: ProjectMap,
//   selected: string
// }

export type InstrumentList = TapisListResults<Streams.Instrument>;

export type InstrumentSiteMap = {
  [ siteId: string ]: InstrumentList
}

export type InstrumentsReducerState = {
  [ projectId: string ]: InstrumentSiteMap
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
  type: typeof ACTIONS.TAPIS_INSTRUMENTS_LIST_REQUEST;
  payload: InstrumentsListingRequestPayload;
}

export type InstrumentsListingSuccess = {
  type: typeof ACTIONS.TAPIS_INSTRUMENTS_LIST_SUCCESS;
  payload: InstrumentsListingSuccessPayload;
}

export type InstrumentsListingFailure = {
  type: typeof ACTIONS.TAPIS_INSTRUMENTS_LIST_FAILURE;
  payload: InstrumentsListingFailurePayload
}

export type InstrumentsListingAction = 
  | InstrumentsListingRequest
  | InstrumentsListingSuccess
  | InstrumentsListingFailure;


export type InstrumentsListCallback = ApiCallback<Streams.RespListInstruments>;
