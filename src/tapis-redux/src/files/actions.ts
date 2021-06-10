import { apiCall } from '../sagas/actions';
import * as ACTIONS from './actionTypes';
import { Files } from '@tapis/tapis-typescript';
import { FileListingCallback } from './types';
import { Config } from 'tapis-redux/types';
import { TAPIS_DEFAULT_FILES_LISTING_LIMIT } from 'tapis-redux/constants/tapis';

// Create a 'list' dispatch generator
export const list = (systemId: string, path: string,
  offset: number = 0, limit: number = TAPIS_DEFAULT_FILES_LISTING_LIMIT,
  config: Config = null, onList: FileListingCallback = null) => {
  // Generate a dispatch that calls the API saga with
  // a systems listing payload

  // Create a request object
  const request: Files.ListFilesRequest = {
    systemId,
    path,
    offset,
    limit
  };
  return apiCall<Files.FileListingResponse>({
    // Optional configuration
    config,
    // Optional callback
    onApi: onList,
    // Dispatches to send to notify the Systems reducer
    dispatches: {
      request: ACTIONS.TAPIS_FILES_LIST_REQUEST,
      success: ACTIONS.TAPIS_FILES_LIST_SUCCESS,
      failure: ACTIONS.TAPIS_FILES_LIST_FAILURE
    },
    // Specify which tapis-typescript module to use
    module: Files,
    // Specify the API constructor
    api: Files.FileOperationsApi,
    // Specify the function name to run 
    func: Files.FileOperationsApi.prototype.listFiles,
    // Provide the arguments for the function
    args: [request]
  });
};
