import React, { useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useList } from 'tapis-hooks/files';
import { Files } from '@tapis/tapis-typescript';
import { Icon } from 'tapis-ui/_common';
import { Button } from 'reactstrap';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import styles from './FileListing.module.scss';

export type OnSelectCallback = (file: Files.FileInfo) => any;
export type OnNavigateCallback = (file: Files.FileInfo) => any;

const FileListingFile: React.FC<{ file: Files.FileInfo }> = ({ file }) => {
  return (
    <div>
      <Icon name="file" /> {file.name}
    </div>
  );
};

interface FileListingDirProps {
  file: Files.FileInfo;
  onNavigate?: OnNavigateCallback;
  location?: string
}

const FileListingDir: React.FC<FileListingDirProps> = ({
  file,
  onNavigate,
  location = undefined
}) => {
  return (
    <div>
      <Icon name="folder" />
      {
        location 
          ? <NavLink to={`${location}${file.name ?? ''}/`} className={styles.dir}>{file.name}</NavLink>
          : <span
              className={`btn btn-link ${styles.dir}`}
              onClick={() => onNavigate && onNavigate(file)}
            >
              {file.name}
            </span>
      }
    </div>
  );
};

interface FileListingItemProps {
  file: Files.FileInfo;
  onSelect?: OnSelectCallback;
  onNavigate?: OnNavigateCallback;
  location?: string
}

const FileListingItem: React.FC<FileListingItemProps> = ({
  file,
  onSelect = undefined,
  onNavigate = undefined,
  location = undefined
}) => {
  return (
    <li onClick={() => (onSelect ? onSelect(file) : null)}>
      {file.type === 'file' ? (
        <FileListingFile file={file} />
      ) : (
        <FileListingDir file={file} onNavigate={onNavigate} location={location} />
      )}
    </li>
  );
};

interface FileListingProps {
  systemId: string;
  path: string;
  onSelect?: OnSelectCallback;
  onNavigate?: OnNavigateCallback;
  location?: string;
}

const FileListing: React.FC<FileListingProps> = ({
  systemId,
  path,
  onSelect = undefined,
  onNavigate = undefined,
  location = undefined
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
              onNavigate={onNavigate}
              location={location}
            />
          )
        );
      })}
      {hasNextPage && <Button onClick={() => fetchNextPage()}>More...</Button>}
    </QueryWrapper>
  );
};

export default FileListing;
