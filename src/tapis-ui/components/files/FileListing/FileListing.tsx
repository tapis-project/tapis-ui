import React, { useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useList } from 'tapis-hooks/files';
import { Files } from '@tapis/tapis-typescript';
import { Icon, InfiniteScrollTable } from 'tapis-ui/_common';
import { Button } from 'reactstrap';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import { Row, Column } from 'react-table';
import sizeFormat from 'utils/sizeFormat';
import { formatDateTimeFromValue } from 'utils/timeFormat';
import styles from './FileListing.module.scss';

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

  /* eslint-disable-next-line */
  const fileSelectCallback = useCallback<OnSelectCallback>(
    (file: Files.FileInfo) => {
      if (onSelect) {
        onSelect(file);
      }
    },
    [onSelect]
  );

  const infiniteScrollCallback = useCallback(
    () => {
      if (hasNextPage) {
        fetchNextPage();
      }
    },
    [ hasNextPage, fetchNextPage ]
  )

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
    },
    {
      Header: 'Size',
      accessor: 'size',
      Cell: (el) => <span>{sizeFormat(el.value)}</span>
    },
    {
      Header: 'Last Modified',
      accessor: 'lastModified',
      Cell: (el) => <span>{formatDateTimeFromValue(new Date(el.value))}</span>
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
        onInfiniteScroll={infiniteScrollCallback}
        isLoading={isLoading}
        noDataText="No files found"
        getRowProps={rowProps}
      />
    </QueryWrapper>
  );
};

export default FileListing;
