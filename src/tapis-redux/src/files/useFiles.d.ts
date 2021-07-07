import { FileListingCallback } from './types';
import { Files } from '@tapis/tapis-typescript';
import { Config } from 'tapis-redux/types';
export interface ListFilesAdditionalParameters {
    onList?: FileListingCallback;
    request: Files.ListFilesRequest;
}
declare const useFiles: (config?: Config) => {
    listings: import("./types").FileListingSystemMap;
    list: (params: ListFilesAdditionalParameters) => import("../sagas/types").ApiSagaRequest<Files.FileListingResponse>;
};
export default useFiles;
