import {
  InstrumentsReducerState,
  InstrumentsListingRequestPayload,
  InstrumentsListingSuccessPayload,
  InstrumentsListingFailurePayload,
  InstrumentsListingAction,
  ProjectMap
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

export const initialState: InstrumentsReducerState = {
  instrumentMap: {},
  selected: null
};

const instrumentMapCheck = (instruments: ProjectMap, projectId: string, siteId: string): ProjectMap => {
  const result: ProjectMap = {...instruments};
  if(!(projectId in result)) {
    result[projectId] = {};
  }
  if(!(siteId in result[projectId])) {
    result[projectId][siteId] = {...emptyResults};
  }
  return result;
}

const setListingRequest = (instruments: ProjectMap, payload: InstrumentsListingRequestPayload): ProjectMap => {
  const {projectUuid, siteId} = payload.params;
  const result: ProjectMap = instrumentMapCheck(instruments, projectUuid, siteId);
  result[projectUuid][siteId] = setRequesting<Streams.Instrument>(result[projectUuid][siteId]);
  return result;
} 

const setListingSuccess = (instruments: ProjectMap, payload: InstrumentsListingSuccessPayload): ProjectMap => {
  const { projectUuid, siteId, offset, limit } = payload.params;
  const { incoming } = payload;
  const result: ProjectMap = instrumentMapCheck(instruments, projectUuid, siteId);
  result[projectUuid][siteId] = updateList<Streams.Instrument>(result[projectUuid][siteId], incoming, offset, limit, TAPIS_DEFAULT_INSTRUMENTS_LISTING_LIMIT);
  return result;
}

const setListingFailure = (instruments: ProjectMap, payload: InstrumentsListingFailurePayload): ProjectMap => {
  const { projectUuid, siteId } = payload.params;
  const { error } = payload;
  const result: ProjectMap = instrumentMapCheck(instruments, projectUuid, siteId);
  result[projectUuid][siteId] = setFailure<Streams.Instrument>(result[projectUuid][siteId], error);
  return result;
}

export function instruments(state: InstrumentsReducerState = initialState, action: InstrumentsListingAction): InstrumentsReducerState {
  switch (action.type) {
    case ACTIONS.TAPIS_INSTRUMENTS_LIST_REQUEST: {
      return {
        instrumentMap: {
          ...state.instrumentMap,
          ...setListingRequest(state.instrumentMap, action.payload)
        },
        selected: state.selected
      };
    }
    case ACTIONS.TAPIS_INSTRUMENTS_LIST_SUCCESS: {
      return {
        instrumentMap: {
          ...state.instrumentMap,
          ...setListingSuccess(state.instrumentMap, action.payload)
        },
        selected: state.selected
      };
    }
    case ACTIONS.TAPIS_INSTRUMENTS_LIST_FAILURE: {
      return {
        instrumentMap: {
          ...state.instrumentMap,
          ...setListingFailure(state.instrumentMap, action.payload)
        },
        selected: state.selected
      };
    }
    case ACTIONS.TAPIS_SELECT_INSTRUMENT: {
      return {
        instrumentMap: state.instrumentMap,
        selected: action.payload
      }
    }
    default:
      return state;
  }
}
