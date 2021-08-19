import React, { useCallback } from 'react';
import { useList } from 'tapis-hooks/files';
import { Files } from '@tapis/tapis-typescript';
import { LoadingSpinner, Message, Icon } from 'tapis-ui/_common';
import { Button } from 'reactstrap';
import './FileListing.scss';

export type OnSelectCallback = (file: Files.FileInfo) => any;

interface FileListingItemProps {
  file: Files.FileInfo,
  onSelect?: OnSelectCallback
}

const FileListingItem: React.FC<FileListingItemProps> = ({ file, onSelect=undefined }) => {
  return (
    <li onClick={() => onSelect ? onSelect(file) : null}>
      {/* will need to conditionally set file icon */}
      <Icon name="file" /> {`${file.name}`}
    </li>
  );
};

interface FileListingProps {
  systemId: string,
  path: string
  onSelect?: OnSelectCallback
}

const FileListing: React.FC<FileListingProps> = ({ 
    systemId, path, onSelect=undefined
  }) => {
 
  const { 
    data, 
    hasNextPage, 
    isLoading, 
    error, 
    fetchNextPage, 
    concatenatedResults
  } = useList({ systemId, path });

  const fileSelectCallback = useCallback<OnSelectCallback>(
    (file: Files.FileInfo) => {
      if (onSelect) {
        onSelect(file);
      }
    },
    [onSelect]
  )

  if (isLoading) {
    return <div className="file-list"><LoadingSpinner /></div>
  }

  if (error) {
    return <Message canDismiss={false} type="error" scope="inline">{(error as any).message}</Message>
  }

  const files: Array<Files.FileInfo> = concatenatedResults ?? [];

  return (
    <div className="file-list">
      {
        files.map((file: Files.FileInfo | null) => {
          return file && (
            <FileListingItem file={file} key={file.name} onSelect={fileSelectCallback} />
          )
        })
      }
      {
        hasNextPage && <Button onClick={() => fetchNextPage()}>More...</Button>
      }
    </div>
  );
};

export default FileListing;
