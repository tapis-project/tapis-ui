import { Files } from '@tapis/tapis-typescript';
import { ApiCallback, TapisListResults } from 'tapis-redux/types';
import * as ACTIONS from './actionTypes';
export declare type FileListingDirectory = TapisListResults<Files.FileInfo>;
export declare type FileListingSystem = {
    [path: string]: FileListingDirectory;
};
export declare type FileListingSystemMap = {
    [systemId: string]: FileListingSystem;
};
export declare type FilesReducerState = {
    listings: FileListingSystemMap;
};
export declare type FileListingCallback = ApiCallback<Files.FileListingResponse>;
export interface FileListingRequestPayload {
    systemId: string;
    path: string;
    offset?: number;
    limit?: number;
}
export interface FileListingSuccessPayload {
    systemId: string;
    path: string;
    incoming: Array<Files.FileInfo>;
    offset: number;
    limit: number;
}
export interface FileListingFailurePayload {
    error: Error;
    systemId: string;
    path: string;
    offset?: number;
    limit?: number;
}
export declare type FileListingRequest = {
    type: typeof ACTIONS.TAPIS_FILES_LIST_REQUEST;
    payload: FileListingRequestPayload;
};
export declare type FileListingSuccess = {
    type: typeof ACTIONS.TAPIS_FILES_LIST_SUCCESS;
    payload: FileListingSuccessPayload;
};
export declare type FileListingFailure = {
    type: typeof ACTIONS.TAPIS_FILES_LIST_FAILURE;
    payload: FileListingFailurePayload;
};
export declare type FileListingActions = FileListingRequest | FileListingSuccess | FileListingFailure;
