import { FilesReducerState, FileListingSystemMap, FileListingActions } from './types';
export declare const initialState: FilesReducerState;
export declare const listingMapCheck: (listings: FileListingSystemMap, systemId: string, path: string) => FileListingSystemMap;
export declare function files(state: FilesReducerState, action: FileListingActions): FilesReducerState;
