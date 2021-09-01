import React, { useCallback } from 'react';
import { useList } from 'tapis-hooks/files';
import { Files } from '@tapis/tapis-typescript';
import { Icon } from 'tapis-ui/_common';
import { Button } from 'reactstrap';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import styles from './FileListing.module.scss';

export type OnSelectCallback = (file: Files.FileInfo) => any;

interface FileListingItemProps {
  file: Files.FileInfo;
  onSelect?: OnSelectCallback;
}

const FileListingItem: React.FC<FileListingItemProps> = ({
  file,
  onSelect = undefined,
}) => {
  return (
    <li onClick={() => (onSelect ? onSelect(file) : null)}>
      {/* will need to conditionally set file icon */}
      <Icon name="file" /> {`${file.name}`}
    </li>
  );
};

interface FileListingProps {
  systemId: string;
  path: string;
  onSelect?: OnSelectCallback;
}

const FileListing: React.FC<FileListingProps> = ({
  systemId,
  path,
  onSelect = undefined,
}) => {
  const { hasNextPage, isLoading, error, fetchNextPage, concatenatedResults } =
    useList({ systemId, path });

  const fileSelectCallback = useCallback<OnSelectCallback>(
    (file: Files.FileInfo) => {
      if (onSelect) {
        onSelect(file);
      }
    },
    [onSelect]
  );

  const files: Array<Files.FileInfo> = concatenatedResults ?? [];

  return (
    <QueryWrapper
      className={styles['file-list']}
      isLoading={isLoading}
      error={error}
    >
      {files.map((file: Files.FileInfo | null) => {
        return (
          file && (
            <FileListingItem
              file={file}
              key={file.name}
              onSelect={fileSelectCallback}
            />
          )
        );
      })}
      {hasNextPage && <Button onClick={() => fetchNextPage()}>More...</Button>}
    </QueryWrapper>
  );
};

export default FileListing;
