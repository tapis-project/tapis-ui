import { AppsReducerState } from '../types';
import {
  AppsListingRequestPayload,
  AppsListingSuccessPayload,
  AppsListingFailurePayload,
} from './types';
import {
  updateList,
  setRequesting,
  setFailure,
  getEmptyListResults,
  TapisListResults
} from 'tapis-redux/types/results'
import { TAPIS_DEFAULT_APPS_LISTING_LIMIT } from 'tapis-redux/constants/tapis';
import * as ACTIONS from './actionTypes';
import { Apps } from '@tapis/tapis-typescript';
import { AppsReducer } from '../types';


const emptyResults = getEmptyListResults<Apps.TapisApp>(TAPIS_DEFAULT_APPS_LISTING_LIMIT);

export const initialState: AppsReducerState = {
  apps: { ...emptyResults }
};

const setListingRequest = (apps: TapisListResults<Apps.TapisApp>,
  payload: AppsListingRequestPayload): TapisListResults<Apps.TapisApp> => {
  const result = setRequesting(apps);
  return result;
} 

const setListingSuccess = (apps: TapisListResults<Apps.TapisApp>,
  payload: AppsListingSuccessPayload): TapisListResults<Apps.TapisApp> => {
  // TODO: Handle different combinations of skip and startAfter requests
  const result = updateList(apps, payload.incoming, payload.params.skip ?? 0, 
    payload.params.limit ?? TAPIS_DEFAULT_APPS_LISTING_LIMIT, TAPIS_DEFAULT_APPS_LISTING_LIMIT);
  return result;
}

const setListingFailure = (apps: TapisListResults<Apps.TapisApp>,
  payload: AppsListingFailurePayload): TapisListResults<Apps.TapisApp> => {
  const result = setFailure(apps, payload.error);
  return result;
}

export const list: AppsReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.TAPIS_APPS_LIST_REQUEST:
      return {
        ...state,
        apps: setListingRequest(state.apps, action.payload)
      };
    case ACTIONS.TAPIS_APPS_LIST_SUCCESS:
      return {
        ...state,
        apps: setListingSuccess(state.apps, action.payload)
      };
    case ACTIONS.TAPIS_APPS_LIST_FAILURE:
      return {
        ...state,
        apps: setListingFailure(state.apps, action.payload)
      };
    default:
      return state;
  }
}
