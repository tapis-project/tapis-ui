import {
  MeasurementsReducerState,
  MeasurementsListingRequestPayload,
  MeasurementsListingSuccessPayload,
  MeasurementsListingFailurePayload
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
  measurements: { ...emptyResults }
};

const setListingRequest = (measurements: TapisListResults<Streams.Measurement>,
  payload: MeasurementsListingRequestPayload): TapisListResults<Streams.Measurement> => {
  const result = setRequesting(measurements);
  return result;
} 

const setListingSuccess = (measurements: TapisListResults<Streams.Measurement>,
  payload: MeasurementsListingSuccessPayload): TapisListResults<Streams.Measurement> => {
  // TODO: Handle different combinations of skip and startAfter requests
  const result = updateList(measurements, payload.incoming, 0, 
    payload.params.limit, TAPIS_DEFAULT_MEASUREMENTS_LISTING_LIMIT);
  return result;
}

const setListingFailure = (measurements: TapisListResults<Streams.Measurement>,
  payload: MeasurementsListingFailurePayload): TapisListResults<Streams.Measurement> => {
  const result = setFailure(measurements, payload.error);
  return result;
}

export function measurements(state: MeasurementsReducerState = initialState, action): MeasurementsReducerState {
  switch (action.type) {
    case ACTIONS.TAPIS_MEASUREMENTS_LIST_REQUEST:
      return {
        ...state,
        measurements: setListingRequest(state.measurements, action.payload)
      };
    case ACTIONS.TAPIS_MEASUREMENTS_LIST_SUCCESS:
      return {
        ...state,
        measurements: setListingSuccess(state.measurements, action.payload)
      };
    case ACTIONS.TAPIS_MEASUREMENTS_LIST_FAILURE:
      return {
        ...state,
        measurements: setListingFailure(state.measurements, action.payload)
      };
    default:
      return state;
  }
}
