import { Files } from '@tapis/tapis-typescript';
import * as ACTIONS from './actionTypes';
import { FilesReducerState, FileListingSystemMap, FileListingActions } from './types';
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

export const updateListing = (listings: FileListingSystemMap, systemId: string, 
  path: string, incoming: Array<Files.FileInfo>, offset: number, limit: number): FileListingSystemMap => {
  // Append listing results to existing definitions, generate new object
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
  systemId: string, path: string): FileListingSystemMap => {
  const result: FileListingSystemMap = listingMapCheck(listings, systemId, path);
  result[systemId][path] = setRequesting<Files.FileInfo>(result[systemId][path]);
  return result;
}

export const setListingFailure = (listings: FileListingSystemMap, systemId: string,
  path: string, error: Error): FileListingSystemMap =>  {
  const result: FileListingSystemMap = listingMapCheck(listings, systemId, path);
  result[systemId][path] = setFailure<Files.FileInfo>(result[systemId][path], error);
  return result;
}

export function files(state = initialState, action: FileListingActions): FilesReducerState {
  const { systemId, path, offset, limit } = action.payload;
  switch (action.type) {
    case ACTIONS.TAPIS_FILES_LIST_REQUEST:
      return {
        ...state,
        listings: setListingRequest(state.listings, systemId, path) 
      };
    case ACTIONS.TAPIS_FILES_LIST_SUCCESS:
      const { incoming } = action.payload;
      return {
        ...state,
        listings: updateListing(
          state.listings, systemId, path, incoming, offset, limit
        )
      };
    case ACTIONS.TAPIS_FILES_LIST_FAILURE:
      const { error } = action.payload;
      return {
        ...state,
        listings: setListingFailure(state.listings, systemId, path, error)
      };
    default:
      return state;
  }
}
