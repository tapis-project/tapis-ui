import {
  VariablesReducerState,
  VariablesListingRequestPayload,
  VariablesListingSuccessPayload,
  VariablesListingFailurePayload,
  VariablesListingAction,
  ProjectMap
} from './types';
import {
  updateList,
  setRequesting,
  setFailure,
  getEmptyListResults
} from 'tapis-redux/types/results'
import { TAPIS_DEFAULT_VARIABLES_LISTING_LIMIT } from 'tapis-redux/constants/tapis';
import * as ACTIONS from './actionTypes';
import { Streams } from "@tapis/tapis-typescript";


const emptyResults = getEmptyListResults(TAPIS_DEFAULT_VARIABLES_LISTING_LIMIT);

export const initialState: VariablesReducerState = {
  variableMap: {},
  selected: null
};

const variableMapCheck = (variables: ProjectMap, projectId: string, siteId: string, instrumentId: string): ProjectMap => {
  const result: ProjectMap = {...variables};
  if(!(projectId in result)) {
    result[projectId] = {};
  }
  if(!(siteId in result[projectId])) {
    result[projectId][siteId] = {};
  }
  if(!(instrumentId in result[projectId][siteId])) {
    result[projectId][siteId][instrumentId] = {...emptyResults};
  }
  return result;
}

const setListingRequest = (variables: ProjectMap, payload: VariablesListingRequestPayload): ProjectMap => {
  const {projectUuid, siteId, instId} = payload.params;
  const result = variableMapCheck(variables, projectUuid, siteId, instId);
  result[projectUuid][siteId][instId] = setRequesting<Streams.Variable>(result[projectUuid][siteId][instId]);
  return result;
} 

const setListingSuccess = (variables: ProjectMap, payload: VariablesListingSuccessPayload): ProjectMap => {
  const { projectUuid, siteId, instId, offset, limit } = payload.params;
  const { incoming } = payload;
  const result: ProjectMap = variableMapCheck(variables, projectUuid, siteId, instId);
  result[projectUuid][siteId][instId] = updateList<Streams.Variable>(result[projectUuid][siteId][instId], incoming, offset, limit, TAPIS_DEFAULT_VARIABLES_LISTING_LIMIT);
  return result;
}

const setListingFailure = (variables: ProjectMap, payload: VariablesListingFailurePayload): ProjectMap => {
  const { projectUuid, siteId, instId } = payload.params;
  const { error } = payload;
  const result: ProjectMap = variableMapCheck(variables, projectUuid, siteId, instId);
  result[projectUuid][siteId][instId] = setFailure<Streams.Variable>(result[projectUuid][siteId][instId], error);
  return result;
}

export function variables(state: VariablesReducerState = initialState, action: VariablesListingAction): VariablesReducerState {
  switch (action.type) {
    case ACTIONS.TAPIS_VARIABLES_LIST_REQUEST: {
      return {
        variableMap: {
          ...state.variableMap,
          ...setListingRequest(state.variableMap, action.payload)
        },
        selected: state.selected
      };
    }
    case ACTIONS.TAPIS_VARIABLES_LIST_SUCCESS: {
      return {
        variableMap: {
          ...state.variableMap,
          ...setListingSuccess(state.variableMap, action.payload)
        },
        selected: state.selected
      };
    }
    case ACTIONS.TAPIS_VARIABLES_LIST_FAILURE: {
      return {
        variableMap: {
          ...state.variableMap,
          ...setListingFailure(state.variableMap, action.payload)
        },
        selected: state.selected
      };
    }
    case ACTIONS.TAPIS_SELECT_VARIABLE: {
      return {
        variableMap: state.variableMap,
        selected: action.payload
      }
    }
    default:
      return state;
  }
}
