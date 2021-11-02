import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useList } from 'tapis-hooks/files';
import { Files } from '@tapis/tapis-typescript';
import { Icon, InfiniteScrollTable } from 'tapis-ui/_common';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import { Row, Column, CellProps } from 'react-table';
import sizeFormat from 'utils/sizeFormat';
import { formatDateTimeFromValue } from 'utils/timeFormat';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckSquare,
  faSquare as filledSquare,
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
  onNavigate = undefined,
  location = undefined,
}) => {
  if (location) {
    return (
      <NavLink to={`${location}${file.name ?? ''}/`} className={styles.dir}>
        {file.name}/
      </NavLink>
    );
  }
  if (onNavigate) {
    return (
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onNavigate(file);
        }}
      >
        {file.name}/
      </a>
    );
  }
  return <span>{file.name}/</span>;
};

type FileListingCheckboxCell = {
  index: number;
  selectedIndices: Array<number>;
};

/* eslint-disable-next-line */
export const FileListingCheckboxCell: React.FC<FileListingCheckboxCell> =
  React.memo(({ index, selectedIndices }) => {
    const selected = selectedIndices.some((existing) => existing === index);
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
  mode: 'none' | 'single' | 'multi';
  // If undefined, allowed selectable file types will be treated as [ "file", "dir" ]
  types?: Array<string>;
};

type FileListingTableProps = {
  files: Array<Files.FileInfo>;
  prependColumns?: Array<Column>;
  appendColumns?: Array<Column>;
  getRowProps?: (row: Row) => any;
  onInfiniteScroll?: () => any;
  isLoading?: boolean;
  onNavigate?: OnNavigateCallback;
  location?: string;
  className?: string;
  select?: SelectMode;
  fields?: Array<'size' | 'lastModified'>;
};

export const FileListingTable: React.FC<FileListingTableProps> = React.memo(
  ({
    files,
    prependColumns = [],
    appendColumns = [],
    getRowProps,
    onInfiniteScroll,
    isLoading,
    onNavigate,
    location,
    className,
    select,
    fields,
  }) => {
    const styleName =
      select?.mode !== 'none' ? 'file-list-select' : 'file-list';

    const tableColumns: Array<Column> = [
      ...prependColumns,
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
    ];

    if (fields?.some((field) => field === 'size')) {
      tableColumns.push({
        Header: 'Size',
        accessor: 'size',
        Cell: (el) => <span>{sizeFormat(el.value)}</span>,
      });
    }

    if (fields?.some((field) => field === 'lastModified')) {
      tableColumns.push({
        Header: 'Last Modified',
        accessor: 'lastModified',
        Cell: (el) => (
          <span>{formatDateTimeFromValue(new Date(el.value))}</span>
        ),
      });
    }

    tableColumns.push(...appendColumns);

    return (
      <InfiniteScrollTable
        className={`${className} ${styles[styleName]}`}
        tableColumns={tableColumns}
        tableData={files}
        onInfiniteScroll={onInfiniteScroll}
        isLoading={isLoading}
        noDataText="No files found"
        getRowProps={getRowProps}
      />
    );
  }
);

interface FileListingProps {
  systemId: string;
  path: string;
  onSelect?: OnSelectCallback;
  onNavigate?: OnNavigateCallback;
  location?: string;
  select?: SelectMode;
  className?: string;
  fields?: Array<'size' | 'lastModified'>;
}

const FileListing: React.FC<FileListingProps> = ({
  systemId,
  path,
  onSelect = undefined,
  onNavigate = undefined,
  location = undefined,
  select = undefined,
  className,
  fields = ['size', 'lastModified'],
}) => {
  const {
    hasNextPage,
    isLoading,
    error,
    fetchNextPage,
    concatenatedResults,
    isFetchingNextPage,
  } = useList({ systemId, path });

  const [selectedIndices, setSelectedIndices] = useState<Array<number>>([]);

  const infiniteScrollCallback = useCallback(() => {
    if (hasNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage]);

  const files: Array<Files.FileInfo> = useMemo(
    () => concatenatedResults ?? [],
    [concatenatedResults]
  );

  const multiSelectCallback = useCallback(
    (index: number) => {
      const newIndices = selectedIndices.some((existing) => existing === index)
        ? // If index is already selected, remove it
          selectedIndices.filter((existing) => existing !== index)
        : // If index is not already selected, add it
          [...selectedIndices, index];

      setSelectedIndices(newIndices);

      if (onSelect) {
        // Find all files that have been selected and send to callback
        const selectedFiles = newIndices.map((index) => files[index]);
        onSelect(selectedFiles);
      }
    },
    [onSelect, selectedIndices, setSelectedIndices, files]
  );

  const singleSelectCallback = useCallback(
    (index: number) => {
      setSelectedIndices([index]);
      onSelect && onSelect([files[index]]);
    },
    [setSelectedIndices, onSelect, files]
  );

  useEffect(() => {
    setSelectedIndices([]);
    onSelect && onSelect([]);
  }, [setSelectedIndices, systemId, path, onSelect]);

  const prependColumns =
    select?.mode !== 'none'
      ? [
          {
            Header: '',
            id: 'multiselect',
            Cell: (el: React.PropsWithChildren<CellProps<{}, any>>) => (
              <FileListingCheckboxCell
                index={el.row.index}
                selectedIndices={selectedIndices}
              />
            ),
          },
        ]
      : [];

  const mapSelectCallback = (
    index: number,
    type: string,
    select?: SelectMode
  ) => {
    if (!select) {
      return undefined;
    }
    // If types is undefined, default to allowing file and dir selection
    if (
      (select?.types ?? ['file', 'dir']).some((allowed) => allowed === type)
    ) {
      if (select?.mode === 'multi') {
        return () => multiSelectCallback(index);
      }
      if (select?.mode === 'single') {
        return () => singleSelectCallback(index);
      }
    }
    return undefined;
  };

  // Maps rows to row properties, such as classNames
  const getRowProps = (row: Row) => {
    const file: Files.FileInfo = row.original as Files.FileInfo;
    return {
      onClick: mapSelectCallback(
        row.index,
        file.type ?? 'unknown_type',
        select
      ),
      'data-testid': file.name,
    };
  };

  return (
    <QueryWrapper isLoading={isLoading} error={error} className={className}>
      <FileListingTable
        files={files}
        prependColumns={prependColumns}
        onInfiniteScroll={infiniteScrollCallback}
        isLoading={isFetchingNextPage}
        getRowProps={getRowProps}
        location={location}
        onNavigate={onNavigate}
        fields={fields}
      />
    </QueryWrapper>
  );
};

export default FileListing;
