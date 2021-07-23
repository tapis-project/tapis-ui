import {
  InstrumentsReducerState,
  InstrumentsListingRequestPayload,
  InstrumentsListingSuccessPayload,
  InstrumentsListingFailurePayload,
  InstrumentsListingAction
} from './types';
import {
  updateList,
  setRequesting,
  setFailure,
  getEmptyListResults
} from 'tapis-redux/types/results'
import { TAPIS_DEFAULT_INSTRUMENTS_LISTING_LIMIT } from 'tapis-redux/constants/tapis';
import * as ACTIONS from './actionTypes';
import { Streams } from "@tapis/tapis-typescript";

const emptyResults = getEmptyListResults(TAPIS_DEFAULT_INSTRUMENTS_LISTING_LIMIT);

export const initialState: InstrumentsReducerState = {};

const instrumentMapCheck = (instruments: InstrumentsReducerState, projectId: string, siteId: string): InstrumentsReducerState => {
  const result: InstrumentsReducerState = {...instruments};
  if(!(projectId in result)) {
    result[projectId] = {};
  }
  if(!(siteId in result[projectId])) {
    result[projectId][siteId] = {...emptyResults};
  }
  return result;
}

const setListingRequest = (instruments: InstrumentsReducerState, payload: InstrumentsListingRequestPayload): InstrumentsReducerState => {
  const {projectUuid, siteId} = payload.params;
  const result = instrumentMapCheck(instruments, projectUuid, siteId);
  result[projectUuid][siteId] = setRequesting<Streams.Instrument>(result[projectUuid][siteId]);
  return result;
} 

const setListingSuccess = (instruments: InstrumentsReducerState, payload: InstrumentsListingSuccessPayload): InstrumentsReducerState => {
  const { projectUuid, siteId, offset, limit } = payload.params;
  const { incoming } = payload;
  const result: InstrumentsReducerState = instrumentMapCheck(instruments, projectUuid, siteId);
  result[projectUuid][siteId] = updateList<Streams.Instrument>(result[projectUuid][siteId], incoming, offset, limit, TAPIS_DEFAULT_INSTRUMENTS_LISTING_LIMIT);
  return result;
}

const setListingFailure = (instruments: InstrumentsReducerState, payload: InstrumentsListingFailurePayload): InstrumentsReducerState => {
  const { projectUuid, siteId } = payload.params;
  const { error } = payload;
  const result: InstrumentsReducerState = instrumentMapCheck(instruments, projectUuid, siteId);
  result[projectUuid][siteId] = setFailure<Streams.Instrument>(result[projectUuid][siteId], error);
  return result;
}

export function instruments(state: InstrumentsReducerState = initialState, action: InstrumentsListingAction): InstrumentsReducerState {
  switch (action.type) {
    case ACTIONS.TAPIS_INSTRUMENTS_LIST_REQUEST:
      return {
        ...state,
        ...setListingRequest(state, action.payload)
      };
    case ACTIONS.TAPIS_INSTRUMENTS_LIST_SUCCESS:
      return {
        ...state,
        ...setListingSuccess(state, action.payload)
      };
    case ACTIONS.TAPIS_INSTRUMENTS_LIST_FAILURE:
      return {
        ...state,
        ...setListingFailure(state, action.payload)
      };
    default:
      return state;
  }
}
