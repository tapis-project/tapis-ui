import React, { useCallback, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useList } from 'tapis-hooks/files';
import { Files } from '@tapis/tapis-typescript';
import { Icon, InfiniteScrollTable } from 'tapis-ui/_common';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import { Row, Column } from 'react-table';
import sizeFormat from 'utils/sizeFormat';
import { formatDateTimeFromValue } from 'utils/timeFormat';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckSquare,
  faSquare as filledSquare
} from '@fortawesome/free-solid-svg-icons';
import { faSquare } from '@fortawesome/free-regular-svg-icons';
import styles from './FileListing.module.scss';

export type OnSelectCallback = (files: Array<Files.FileInfo>) => any;
export type OnNavigateCallback = (file: Files.FileInfo) => any;

interface FileListingDirProps {
  file: Files.FileInfo;
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
    );
  }
  return (
    <span
      className={`btn btn-link ${styles.dir}`}
      onClick={() => onNavigate && onNavigate(file)}
    >
      {file.name}/
    </span>
  );
};

type FileListingCheckboxCell = {
  index: number,
  selectedIndices: Array<number>
}

/* eslint-disable-next-line */
export const FileListingCheckboxCell: React.FC<FileListingCheckboxCell> = React.memo(({ index, selectedIndices }) => {
  const selected = selectedIndices.some(existing => existing === index)
  return (
    <span className="fa-layers fa-fw">
      <FontAwesomeIcon icon={filledSquare} color="white" />
      <FontAwesomeIcon
        icon={selected ? faCheckSquare : faSquare}
        color="#9D85EF"
      />
      <FontAwesomeIcon icon={faSquare} color="#707070" />
    </span>
  );
});

interface FileListingItemProps {
  file: Files.FileInfo;
  onNavigate?: OnNavigateCallback;
  location?: string;
}

const FileListingName: React.FC<FileListingItemProps> = ({
  file,
  onNavigate = undefined,
  location = undefined,
}) => {
  if (file.type === 'file') {
    return <>{file.name}</>;
  }
  return (
    <FileListingDir file={file} onNavigate={onNavigate} location={location} />
  );
};

type SelectMode = {
  mode: "none" | "single" | "multi";
  files?: boolean;
  dirs?: boolean;
}

interface FileListingProps {
  systemId: string;
  path: string;
  onSelect?: OnSelectCallback;
  onNavigate?: OnNavigateCallback;
  location?: string;
  select?: SelectMode
}

const FileListing: React.FC<FileListingProps> = ({
  systemId,
  path,
  onSelect = undefined,
  onNavigate = undefined,
  location = undefined,
  select = undefined
}) => {
  const {
    hasNextPage,
    isLoading,
    error,
    fetchNextPage,
    concatenatedResults,
    isFetchingNextPage,
  } = useList({ systemId, path });

  const [ selectedIndices, setSelectedIndices ] = useState<Array<number>>([]);

  const infiniteScrollCallback = useCallback(() => {
    if (hasNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage]);

  const files: Array<Files.FileInfo> = concatenatedResults ?? [];

  const multiSelectCallback = useCallback(
    (index: number) => {
      const newIndices = selectedIndices.some(existing => existing === index)
        // If index is already selected, remove it
        ? selectedIndices.filter(existing => existing !== index)
        // If index is not already selected, add it
        : [ ...selectedIndices, index ]
      
      setSelectedIndices(newIndices);

      if (onSelect) {
        // Find all files that have been selected and send to callback
        const selectedFiles = newIndices.map(index => files[index])
        onSelect(selectedFiles);
      }

    },
    [ onSelect, selectedIndices, setSelectedIndices, files ]
  );

  const tableColumns: Array<Column> = [
    {
      Header: '',
      accessor: 'type',
      Cell: (el) => <Icon name={el.value === 'file' ? 'file' : 'folder'} />,
    },
    {
      Header: 'Name',
      Cell: (el) => (
        <FileListingName
          file={el.row.original}
          onNavigate={onNavigate}
          location={location}
        />
      ),
    },
    {
      Header: 'Size',
      accessor: 'size',
      Cell: (el) => <span>{sizeFormat(el.value)}</span>,
    },
    {
      Header: 'Last Modified',
      accessor: 'lastModified',
      Cell: (el) => <span>{formatDateTimeFromValue(new Date(el.value))}</span>,
    },
  ];

  if (select?.mode === "multi") {
    tableColumns.unshift({
      Header: '',
      id: "multiselect",
      Cell: (el) => <FileListingCheckboxCell index={el.row.index} selectedIndices={selectedIndices} />
    });
  }

  // Maps rows to row properties, such as classNames
  const rowProps = (row: Row) => ({
    onClick: () => multiSelectCallback(row.index),
    "data-testid": (row.original as Files.FileInfo).name
  });

  const styleName = select?.mode === 'multi' ? 'file-list-multiselect' : 'file-list';
  return (
    <QueryWrapper
      className={styles[styleName]}
      isLoading={isLoading}
      error={error}
    >
      <InfiniteScrollTable
        tableColumns={tableColumns}
        tableData={files}
        onInfiniteScroll={infiniteScrollCallback}
        isLoading={isFetchingNextPage}
        noDataText="No files found"
        getRowProps={rowProps}
      />
    </QueryWrapper>
  );
};

export default FileListing;