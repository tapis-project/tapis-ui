import React from 'react';
import { FileListingCallback } from 'tapis-redux/files/types';
import { Config } from 'tapis-redux/types';
import { Files } from '@tapis/tapis-typescript';
export declare type OnSelectCallback = (file: Files.FileInfo) => any;
interface FileListingProps {
    systemId: string;
    path: string;
    config?: Config;
    onList?: FileListingCallback;
    onSelect?: OnSelectCallback;
}
declare const FileListing: React.FC<FileListingProps>;
export default FileListing;
