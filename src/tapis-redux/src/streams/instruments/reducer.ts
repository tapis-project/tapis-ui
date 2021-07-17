import {
  InstrumentsReducerState,
  InstrumentsListingRequestPayload,
  InstrumentsListingSuccessPayload,
  InstrumentsListingFailurePayload
} from './types';
import {
  updateList,
  setRequesting,
  setFailure,
  getEmptyListResults,
  TapisListResults
} from 'tapis-redux/types/results'
import { TAPIS_DEFAULT_INSTRUMENTS_LISTING_LIMIT } from 'tapis-redux/constants/tapis';
import * as ACTIONS from './actionTypes';
import { Streams } from "@tapis/tapis-typescript";


const emptyResults = getEmptyListResults(TAPIS_DEFAULT_INSTRUMENTS_LISTING_LIMIT);

export const initialState: InstrumentsReducerState = {
  instruments: { ...emptyResults }
};

const setListingRequest = (instruments: TapisListResults<Streams.Instrument>,
  payload: InstrumentsListingRequestPayload): TapisListResults<Streams.Instrument> => {
  const result = setRequesting(instruments);
  return result;
} 

const setListingSuccess = (instruments: TapisListResults<Streams.Instrument>,
  payload: InstrumentsListingSuccessPayload): TapisListResults<Streams.Instrument> => {
  // TODO: Handle different combinations of skip and startAfter requests
  const result = updateList(instruments, payload.incoming, 0, 
    payload.params.limit, TAPIS_DEFAULT_INSTRUMENTS_LISTING_LIMIT);
  return result;
}

const setListingFailure = (instruments: TapisListResults<Streams.Instrument>,
  payload: InstrumentsListingFailurePayload): TapisListResults<Streams.Instrument> => {
  const result = setFailure(instruments, payload.error);
  return result;
}

export function instruments(state: InstrumentsReducerState = initialState, action): InstrumentsReducerState {
  switch (action.type) {
    case ACTIONS.TAPIS_INSTRUMENTS_LIST_REQUEST:
      return {
        ...state,
        instruments: setListingRequest(state.instruments, action.payload)
      };
    case ACTIONS.TAPIS_INSTRUMENTS_LIST_SUCCESS:
      return {
        ...state,
        instruments: setListingSuccess(state.instruments, action.payload)
      };
    case ACTIONS.TAPIS_INSTRUMENTS_LIST_FAILURE:
      return {
        ...state,
        instruments: setListingFailure(state.instruments, action.payload)
      };
    default:
      return state;
  }
}
