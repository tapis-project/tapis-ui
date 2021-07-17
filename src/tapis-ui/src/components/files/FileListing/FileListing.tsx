import React, { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useFiles } from 'tapis-redux';
import getListing from 'tapis-redux/files/selectors';
import { FileListingCallback, FileListingDirectory } from 'tapis-redux/files/types';
import { Config, TapisState } from 'tapis-redux/types';
import { Files } from '@tapis/tapis-typescript';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from "uuid";
import { LoadingSpinner, Message, Icon } from 'tapis-ui/_common';
import './FileListing.scss';

export type OnSelectCallback = (file: Files.FileInfo) => any;

interface FileListingItemProps {
  file: Files.FileInfo,
  onSelect?: OnSelectCallback
}

const FileListingItem: React.FC<FileListingItemProps> = ({ file, onSelect }) => {
  return (
    <li onClick={() => onSelect ? onSelect(file) : null}>
      {/* will need to conditionally set file icon */}
      <Icon name="file" /> {`${file.name}`}
    </li>
  );
};

FileListingItem.defaultProps = {
  onSelect: null
}

interface FileListingProps {
  systemId: string,
  path: string,
  config?: Config,
  onList?: FileListingCallback,
  onSelect?: OnSelectCallback
}

const FileListing: React.FC<FileListingProps> = ({ systemId, path, config, onList, onSelect }) => {
  const dispatch = useDispatch();

  // Get a file listing given the systemId and path
  const { list } = useFiles(config);
  useEffect(() => {
    dispatch(list({ onList, request: { systemId, path } }));
  }, [dispatch, systemId, path, onList]);

  // Get the file listing for this systemId and path
  const result: FileListingDirectory = useSelector<TapisState, FileListingDirectory>(
    getListing(systemId, path)
  );

  const fileSelectCallback = useCallback<OnSelectCallback>(
    (file: Files.FileInfo) => {
      if (onSelect) {
        onSelect(file);
      }
    },
    [onSelect]
  )

  if (!result || result.loading) {
    return <div className="file-list"><LoadingSpinner /></div>
  }

  if (result.error) {
    return <Message canDismiss={false} type="error" scope="inline">{result.error.message}</Message>
  }

  //is path unique?
  const files: Array<Files.FileInfo> = result.results;

  return (
    <div className="file-list">
      {
        files.map((file: Files.FileInfo) => {
          return (
            <FileListingItem key={uuidv4()} file={file}  />
          )
        })
      }
    </div>
  );
};

FileListing.defaultProps = {
  config: null,
  onList: null,
  onSelect: null
}

export default FileListing;
