import { Files } from '@tapis/tapis-typescript';
import { ApiCallback, PaginatedResults } from 'tapis-redux/types';
import * as ACTIONS from './actionTypes';

export type FileListingDirectory = PaginatedResults<Files.FileInfo>;

export type FileListingSystem = {
  [ path: string ]: FileListingDirectory
}

export type FileListingSystemMap = {
  [ systemId: string ]: FileListingSystem
}

export type FilesReducerState = {
  listings: FileListingSystemMap
}

export type FileListingCallback = ApiCallback<Files.FileListingResponse>;

export interface FileListingRequestPayload {
  systemId: string,
  path: string,
  offset?: number,
  limit?: number
}

export interface FileListingSuccessPayload {
  systemId: string,
  path: string,
  incoming: Array<Files.FileInfo>,
  offset: number,
  limit: number
}

export interface FileListingFailurePayload {
  error: Error,
  systemId: string,
  path: string,
  offset?: number,
  limit?: number
}

export type FileListingRequest = {
  type: typeof ACTIONS.TAPIS_FILES_LIST_REQUEST;
  payload: FileListingRequestPayload;
}

export type FileListingSuccess = {
  type: typeof ACTIONS.TAPIS_FILES_LIST_SUCCESS;
  payload: FileListingSuccessPayload;
}

export type FileListingFailure = {
  type: typeof ACTIONS.TAPIS_FILES_LIST_FAILURE;
  payload: FileListingFailurePayload
}

export type FileListingActions = 
  | FileListingRequest
  | FileListingSuccess
  | FileListingFailure;
