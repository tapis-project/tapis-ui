import {
  MeasurementsReducerState,
  MeasurementsListingRequestPayload,
  MeasurementsListingSuccessPayload,
  MeasurementsListingFailurePayload,
  InstrumentMap
} from './types';
import {
  updateList,
  setRequesting,
  setFailure,
  getEmptyListResults,
  TapisListResults
} from 'tapis-redux/types/results'
import { TAPIS_DEFAULT_MEASUREMENTS_LISTING_LIMIT } from 'tapis-redux/constants/tapis';
import * as ACTIONS from './actionTypes';
import { Streams } from "@tapis/tapis-typescript";


const emptyResults = getEmptyListResults(TAPIS_DEFAULT_MEASUREMENTS_LISTING_LIMIT);

export const initialState: MeasurementsReducerState = {
  measurementMap: {},
  selected: null
};

const variablesMapCheck = (variables: InstrumentMap, instrumentId: string): InstrumentMap => {
  const result: InstrumentMap = {...variables};
  if(!(instrumentId in result)) {
    result[instrumentId] = {...emptyResults}
  }
  return result;
}

const setListingRequest = (measurements: InstrumentMap, payload: MeasurementsListingRequestPayload): InstrumentMap => {
  const { instId } = payload.params;
  const result: InstrumentMap = variablesMapCheck(measurements, instId);
  result[instId] = setRequesting<Streams.Measurement>(result[instId]);
  return result;
} 

const setListingSuccess = (measurements: InstrumentMap, payload: MeasurementsListingSuccessPayload): InstrumentMap => {
  const { instId, offset, limit } = payload.params;
  const { incoming } = payload;
  const result: InstrumentMap = variablesMapCheck(measurements, instId);
  result[instId] = updateList<Streams.Measurement>(result[instId], incoming, offset, limit, TAPIS_DEFAULT_MEASUREMENTS_LISTING_LIMIT);
  return result;
}

const setListingFailure = (measurements: InstrumentMap, payload: MeasurementsListingFailurePayload): InstrumentMap => {
  const { instId } = payload.params;
  const { error } = payload;
  const result: InstrumentMap = variablesMapCheck(measurements, instId);
  result[instId] = setFailure<Streams.Measurement>(result[instId], error);
  return result;
}

export function measurements(state: MeasurementsReducerState = initialState, action): MeasurementsReducerState {
  switch (action.type) {
    case ACTIONS.TAPIS_MEASUREMENTS_LIST_REQUEST: {
      return {
        measurementMap: {
          ...state.measurementMap,
          ...setListingRequest(state.measurementMap, action.payload)
        },
        selected: state.selected
      };
    }
    case ACTIONS.TAPIS_MEASUREMENTS_LIST_SUCCESS: {
      return {
        measurementMap: {
          ...state.measurementMap,
          ...setListingSuccess(state.measurementMap, action.payload)
        },
        selected: state.selected
      };
    }
    case ACTIONS.TAPIS_MEASUREMENTS_LIST_FAILURE: {
      return {
        measurementMap: {
          ...state.measurementMap,
          ...setListingFailure(state.measurementMap, action.payload)
        },
        selected: state.selected
      };
    }
    case ACTIONS.TAPIS_SELECT_MEASUREMENT: {
      
    }
    default:
      return state;
  }
}
