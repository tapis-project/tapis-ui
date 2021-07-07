import { Files } from '@tapis/tapis-typescript';
import { FileListingCallback } from './types';
import { Config } from 'tapis-redux/types';
export declare const list: (config: Config, onList: FileListingCallback, request: Files.ListFilesRequest) => import("tapis-redux/sagas/types").ApiSagaRequest<Files.FileListingResponse>;
