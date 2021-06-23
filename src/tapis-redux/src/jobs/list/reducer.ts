import { JobsReducerState } from '../types';
import {
  JobsListingRequestPayload,
  JobsListingSuccessPayload,
  JobsListingFailurePayload,
  JobsListingAction
} from './types';
import {
  updateList,
  setRequesting,
  setFailure,
  getEmptyListResults,
  TapisListResults
} from 'tapis-redux/types/results'
import { TAPIS_DEFAULT_JOBS_LISTING_LIMIT } from 'tapis-redux/constants/tapis';
import * as ACTIONS from './actionTypes';
import { Jobs, Systems } from '@tapis/tapis-typescript';
import { JobsReducer, JobsAction } from '../types';


const emptyResults = getEmptyListResults(TAPIS_DEFAULT_JOBS_LISTING_LIMIT);

export const initialState: JobsReducerState = {
  jobs: { ...emptyResults }
};

const setListingRequest = (apps: TapisListResults<Jobs.JobListDTO>,
  payload: JobsListingRequestPayload): TapisListResults<Jobs.JobListDTO> => {
  const result = setRequesting(apps);
  return result;
} 

const setListingSuccess = (apps: TapisListResults<Jobs.JobListDTO>,
  payload: JobsListingSuccessPayload): TapisListResults<Jobs.JobListDTO> => {
  // TODO: Handle different combinations of skip and startAfter requests
  const result = updateList(apps, payload.incoming, payload.params.skip, 
    payload.params.limit, TAPIS_DEFAULT_JOBS_LISTING_LIMIT);
  return result;
}

const setListingFailure = (systems: TapisListResults<Jobs.JobListDTO>,
  payload: JobsListingFailurePayload): TapisListResults<Jobs.JobListDTO> => {
  const result = setFailure(systems, payload.error);
  return result;
}

export const list: JobsReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.TAPIS_JOBS_LIST_REQUEST:
      return {
        ...state,
        apps: setListingRequest(state.jobs, action.payload)
      };
    case ACTIONS.TAPIS_JOBS_LIST_SUCCESS:
      return {
        ...state,
        apps: setListingSuccess(state.jobs, action.payload)
      };
    case ACTIONS.TAPIS_JOBS_LIST_FAILURE:
      return {
        ...state,
        apps: setListingFailure(state.jobs, action.payload)
      };
    default:
      return state;
  }
}
