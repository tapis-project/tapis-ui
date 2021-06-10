import { Files } from '@tapis/tapis-typescript';
import * as ACTIONS from './actionTypes';
import {
  FilesReducerState,
  FileListingSystemMap,
  FileListingActions,
  FileListingRequestPayload,
  FileListingFailurePayload,
  FileListingSuccessPayload
} from './types';
import {
  updateResults,
  setRequesting,
  setFailure,
  getEmptyPaginatedResults
} from 'tapis-redux/types/paginated';
import { TAPIS_DEFAULT_FILES_LISTING_LIMIT } from 'tapis-redux/constants/tapis';

export const initialState: FilesReducerState = {
  listings: {}
};

// Generates a listing state that has at least a default systemId and path entry
export const listingMapCheck = (listings: FileListingSystemMap, 
  systemId: string, path: string): FileListingSystemMap => {
  const result: FileListingSystemMap = { ...listings };
  if (!(systemId in result)) {
    result[systemId] = {}
  }
  if (!(path in result[systemId])) {
    result[systemId][path] = getEmptyPaginatedResults<Files.FileInfo>(
      TAPIS_DEFAULT_FILES_LISTING_LIMIT);
  }
  return result;
}

export const updateListing = (listings: FileListingSystemMap, payload: FileListingSuccessPayload): FileListingSystemMap => {
  // Append listing results to existing definitions, generate new object
  const { systemId, path, incoming, offset, limit } = payload;
  const result: FileListingSystemMap = listingMapCheck(listings, systemId, path);
  result[systemId][path] = updateResults<Files.FileInfo>(
    result[systemId][path],
    incoming,
    offset,
    limit, 
    TAPIS_DEFAULT_FILES_LISTING_LIMIT
  );
  return result;
};

export const setListingRequest = (listings: FileListingSystemMap, 
  payload: FileListingRequestPayload): FileListingSystemMap => {
  const { systemId, path } = payload;
  const result: FileListingSystemMap = listingMapCheck(listings, systemId, path);
  result[systemId][path] = setRequesting<Files.FileInfo>(result[systemId][path]);
  return result;
}

export const setListingFailure = (listings: FileListingSystemMap, 
  payload: FileListingFailurePayload): FileListingSystemMap =>  {
  const { systemId, path, error } = payload;
  const result: FileListingSystemMap = listingMapCheck(listings, systemId, path);
  result[systemId][path] = setFailure<Files.FileInfo>(result[systemId][path], error);
  return result;
}

export function files(state = initialState, action: FileListingActions): FilesReducerState {
  switch (action.type) {
    case ACTIONS.TAPIS_FILES_LIST_REQUEST:
      return {
        ...state,
        listings: setListingRequest(state.listings, action.payload) 
      };
    case ACTIONS.TAPIS_FILES_LIST_SUCCESS:
      return {
        ...state,
        listings: updateListing(state.listings, action.payload)
      };
    case ACTIONS.TAPIS_FILES_LIST_FAILURE:
      return {
        ...state,
        listings: setListingFailure(state.listings, action.payload)
      };
    default:
      return state;
  }
}
