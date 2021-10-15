import React, { useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useList } from 'tapis-hooks/files';
import { Files } from '@tapis/tapis-typescript';
import { Icon, InfiniteScrollTable } from 'tapis-ui/_common';
import { Button } from 'reactstrap';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import { Row, Column, useTable } from 'react-table';
import styles from './FileListing.module.scss';
import { type } from 'os';

export type OnSelectCallback = (file: Files.FileInfo) => any;
export type OnNavigateCallback = (file: Files.FileInfo) => any;

interface FileListingDirProps {
  file: Files.FileInfo,
  onNavigate?: OnNavigateCallback;
  location?: string;
}

const FileListingDir: React.FC<FileListingDirProps> = ({
  file,
  onNavigate,
  location = undefined,
}) => {
  if (location) {
    return (
      <NavLink to={`${location}${file.name ?? ''}/`} className={styles.dir}>
        {file.name}/
      </NavLink>
    )
  }
  return (
    <span
      className={`btn btn-link ${styles.dir}`}
      onClick={() => onNavigate && onNavigate(file)}
    >
      {file.name}/
    </span>
  )
};

interface FileListingItemProps {
  file: Files.FileInfo,
  onNavigate?: OnNavigateCallback;
  location?: string;
}

const FileListingName: React.FC<FileListingItemProps> = ({
  file,
  onNavigate = undefined,
  location = undefined,
}) => {
  if (file.type === 'file') {
    return <>{file.name}</>
  }
  return (
    <FileListingDir file={file} onNavigate={onNavigate} location={location} />
  )
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
  location = undefined,
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

  const tableColumns: Array<Column> = [
    {
      Header: '',
      accessor: 'type',
      Cell: (el) => <Icon name={el.value === 'file' ? 'file' : 'folder'} />
    },
    {
      Header: 'Name',
      Cell: (el) => <FileListingName file={el.row.original} onNavigate={onNavigate} location={location} />
    }
  ]

  // Maps rows to row properties, such as classNames
  const rowProps = (row: Row) => {}

  return (
    <QueryWrapper
      className={styles['file-list']}
      isLoading={isLoading}
      error={error}
    >
      <InfiniteScrollTable
        tableColumns={tableColumns}
        tableData={files}
        onInfiniteScroll={fetchNextPage}
        isLoading={isLoading}
        noDataText="No files found"
        getRowProps={rowProps}
      />
      {
      /*files.map((file: Files.FileInfo | null) => {
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
      })*/}
      {hasNextPage && <Button onClick={() => fetchNextPage()}>More...</Button>}
    </QueryWrapper>
  );
};

export default FileListing;
