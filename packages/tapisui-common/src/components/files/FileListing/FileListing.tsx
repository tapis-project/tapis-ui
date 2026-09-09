import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
  useSyncExternalStore,
} from 'react';
import { NavLink } from 'react-router-dom';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import { Files } from '@tapis/tapis-typescript';
import { InfiniteScrollTable } from '../../../ui';
import { QueryWrapper } from '../../../wrappers';
import FilesErrorPanel, {
  FilesErrorExplanation,
  explainFilesError,
  filesErrorSummary,
} from './FilesError';
import { Row, Column, CellProps } from 'react-table';
import sizeFormat from '../../../utils/sizeFormat';
import { Button } from 'reactstrap';
import { formatDateTimeFromValue } from '../../../utils/timeFormat';
import {
  CheckBoxOutlineBlank,
  CheckBox,
  InsertDriveFileOutlined,
  FolderOutlined,
  Link,
  QuestionMark,
} from '@mui/icons-material';
import styles from './FileListing.module.scss';
import { Box, Snackbar, Tooltip, Typography } from '@mui/material';
import { CloseRounded, LockOutlined } from '@mui/icons-material';
import FileListingTableV2, { canSelectFile } from './FileListingTableV2';
import FileViewerPanel from './FileViewerPanel';
import { useBackKeys } from './keyboardNav';
import FilesDropZone from './FilesDropZone';
import {
  getListingDensity,
  getListingDetails,
  getListingVariant,
  subscribeListingPrefs,
} from './listingPrefs';

/**
 * How many files a page of the listing fetches.
 *
 * Fifty rather than the API's hundred: the listing windows its rows and
 * fetches the next page a screen early, so a smaller page reaches the screen
 * sooner and a directory of four hundred costs nothing extra to walk.
 */
export const LISTING_PAGE_SIZE = 50;

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
      <NavLink to={`${location}/${file.name ?? ''}`} className={styles.dir}>
        {file.name}/
      </NavLink>
    );
  }
  if (onNavigate) {
    return (
      <Button
        color="link"
        className={styles.link}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onNavigate(file);
        }}
        data-testid={`btn-link-${file.name}`}
      >
        {file.name}/
      </Button>
    );
  }
  return <span>{file.name}/</span>;
};

type FileListingCheckboxCell = {
  selected: boolean;
};

/* eslint-disable-next-line */
export const FileListingCheckboxCell: React.FC<FileListingCheckboxCell> =
  React.memo(({ selected }) => {
    return <span>{selected ? <CheckBox /> : <CheckBoxOutlineBlank />}</span>;
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

export type SelectMode = {
  mode: 'none' | 'single' | 'multi';
  // If undefined, allowed selectable file types will be treated as [ "file", "dir" ]
  types?: Array<'dir' | 'file'>;
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
  selectMode?: SelectMode;
  fields?: Array<'size' | 'lastModified'>;
};

const resolveIcon = (type: Files.FileInfo['type']) => {
  let icon: React.ReactElement = <></>;
  switch (type) {
    case Files.FileTypeEnum.File:
      icon = <InsertDriveFileOutlined />;
      break;
    case Files.FileTypeEnum.Dir:
      icon = <FolderOutlined />;
      break;
    case Files.FileTypeEnum.SymbolicLink:
      icon = <Link />;
      break;
    case Files.FileTypeEnum.Other:
    case Files.FileTypeEnum.Unknown:
    default:
      icon = <QuestionMark />;
      break;
  }

  return <Tooltip title={type}>{icon}</Tooltip>;
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
    selectMode,
    fields,
  }) => {
    const styleName =
      selectMode?.mode !== 'none' ? 'file-list-select' : 'file-list';

    const tableColumns: Array<Column> = [
      ...prependColumns,
      {
        Header: '',
        accessor: 'type',
        Cell: (el) => resolveIcon(el.value),
      },
      {
        Header: 'filename',
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
        Header: 'size',
        accessor: 'size',
        Cell: (el) => <span>{sizeFormat(el.value)}</span>,
      });
    }

    if (fields?.some((field) => field === 'lastModified')) {
      tableColumns.push({
        Header: 'last modified',
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

type FileSelectHeaderProps = {
  onSelectAll: () => void;
  onUnselectAll: () => void;
  selectedFileDict: SelectFileDictType;
};

type SelectFileDictType = { [path: string]: boolean };

const FileSelectHeader: React.FC<FileSelectHeaderProps> = ({
  onSelectAll,
  onUnselectAll,
  selectedFileDict,
}) => {
  const [checked, setChecked] = useState(false);
  const allSelected = Object.values(selectedFileDict).some(
    (value) => value === false
  );
  const onClick = useCallback(() => {
    if (checked && !allSelected) {
      setChecked(false);
      onUnselectAll();
    } else {
      setChecked(true);
      onSelectAll();
    }
  }, [checked, setChecked, onSelectAll, onUnselectAll, allSelected]);

  return (
    <span
      className={styles['select-all']}
      onClick={onClick}
      data-testid="select-all"
    >
      <FileListingCheckboxCell selected={checked && !allSelected} />
    </span>
  );
};

interface FileListingProps {
  systemId: string;
  path: string;
  onSelect?: OnSelectCallback;
  onUnselect?: OnSelectCallback;
  onNavigate?: OnNavigateCallback;
  location?: string;
  className?: string;
  fields?: Array<'size' | 'lastModified'>;
  selectedFiles?: Array<Files.FileInfo>;
  selectMode?: SelectMode;
  /** `single` for a picker — see FileListingTableV2 */
  openOn?: 'single' | 'double';
  /**
   * Whether dropping files here uploads them.
   *
   * False in a picker: you are choosing a destination for something that
   * already exists, and a drop target in the middle of that is an offer to
   * do a different job than the one you opened the dialog for.
   */
  dropToUpload?: boolean;
  /** ← ⌫ and the second Esc, shared with the path bar's back arrow */
  onBack?: () => void;
  /**
   * Up one directory, for the explanation panel.
   *
   * Separate from onBack on purpose: the keyboard's ← is history, and the
   * panel never offers history — from a link or a fresh tab there is none,
   * and where you happened to be before is not an answer to a door that
   * will not open.
   */
  onUp?: () => void;
  /** the top of this system, in place — a link would leave a job's page */
  onTop?: () => void;
  /**
   * What to do with files dropped on the listing.
   *
   * The listing does not upload them: a drop is one gesture, and the same
   * gesture starts a drag you meant to cancel. The page hands them to the
   * upload modal, which already exists and already has an Upload press.
   * Without this, dropping does nothing.
   */
  onDropFiles?: (files: File[]) => void;
  /** false where the listing is one section of a scrolling page */
  keyboard?: boolean;
}

const FileListing: React.FC<FileListingProps> = ({
  systemId,
  path,
  onSelect = undefined,
  onUnselect = undefined,
  onNavigate = undefined,
  location = undefined,
  className,
  fields = ['size', 'lastModified'],
  selectedFiles = [],
  selectMode,
  openOn,
  dropToUpload = true,
  onBack,
  onUp,
  onTop,
  onDropFiles,
  keyboard,
}) => {
  // The classic table is one Settings switch away; everything else about
  // this component — the hook, the selection model, the error panel — is
  // shared, so the choice is only about which table renders it.
  // Which file the side panel is showing. Owned here rather than by the page
  // so both file browsers — the Files page and a job's output listing — get
  // the viewer without either of them having to wire it up.
  const [viewing, setViewing] = useState<Files.FileInfo | undefined>(undefined);
  /**
   * A file that cannot be read, said in passing.
   *
   * The viewer used to open onto it and print "Could not fetch this file /
   * 500 from the file" — a window, for a file it was never going to show,
   * carrying the least informative sentence in the response. The listing is
   * still fine, so the window closes and this says why, where a message
   * about the thing you just pressed belongs.
   */
  const [notice, setNotice] = useState<
    { title: string; detail: string } | undefined
  >(undefined);
  const unavailable = useCallback(
    (file: Files.FileInfo) =>
      ({ explanation }: { explanation: FilesErrorExplanation }) => {
        setViewing(undefined);
        setNotice(
          filesErrorSummary(explanation, file.name ?? 'that file', systemId)
        );
      },
    [systemId]
  );

  /**
   * Coming up out of a directory should leave you standing on it.
   *
   * Go into results/, look around, press back — and the listing you land on
   * has forgotten results/ entirely, so the next ↓ starts from the top of
   * the directory again. Every file manager puts you back on the folder you
   * just left, because that is where you were.
   */
  const previousPath = useRef<string | undefined>(undefined);
  const [cameFrom, setCameFrom] = useState<string | undefined>(undefined);
  useEffect(() => {
    const before = previousPath.current;
    previousPath.current = path;
    if (!before || before === path) return;
    const clean = (value: string) =>
      `/${value.split('/').filter(Boolean).join('/')}`;
    const from = clean(before);
    const to = clean(path);
    // only when the new path is an ancestor of the old one: arriving
    // somewhere unrelated has no folder to have come from
    const under = to === '/' ? from.length > 1 : from.startsWith(`${to}/`);
    setCameFrom(
      under
        ? from.slice(to === '/' ? 1 : to.length + 1).split('/')[0]
        : undefined
    );
  }, [path]);

  // The order the table is showing, so the viewer's arrows walk the sequence
  // you can see rather than the one the API happened to return.
  const [order, setOrder] = useState<Array<Files.FileInfo>>([]);
  const readable = useMemo(
    () => order.filter((file) => file.type !== Files.FileTypeEnum.Dir),
    [order]
  );
  const viewingAt = viewing
    ? readable.findIndex((file) => file.path === viewing.path)
    : -1;
  const step = useCallback(
    (delta: number) => {
      const next = readable[viewingAt + delta];
      if (next) setViewing(next);
    },
    [readable, viewingAt]
  );

  const variant = useSyncExternalStore(
    subscribeListingPrefs,
    getListingVariant
  );
  const density = useSyncExternalStore(
    subscribeListingPrefs,
    getListingDensity
  );
  const details = useSyncExternalStore(
    subscribeListingPrefs,
    getListingDetails
  );

  const {
    hasNextPage,
    isLoading,
    error,
    fetchNextPage,
    concatenatedResults,
    isFetchingNextPage,
    data,
  } = Hooks.useList({ systemId, path, limit: LISTING_PAGE_SIZE }, { retry: 0 });

  // Tapis returns this untyped, and for Files it is usually absent or -1 —
  // there is no computeTotal on the listing call. Read it when a deployment
  // does send one, and say '200+' rather than inventing a denominator when
  // it does not.
  const total = useMemo(() => {
    const metadata = (data?.pages?.[0] as { metadata?: unknown } | undefined)
      ?.metadata as { totalCount?: number } | undefined;
    const count = metadata?.totalCount;
    return typeof count === 'number' && count > 0 ? count : undefined;
  }, [data]);

  const infiniteScrollCallback = useCallback(() => {
    if (hasNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage]);

  /**
   * The files, at a stable identity.
   *
   * The hook rebuilds concatenatedResults with a fresh `concat` on EVERY
   * render, so keying a memo on it produces a new array every render too.
   * That was merely wasteful until the table started reporting its sort
   * order upward — then a new array meant a new sort, which meant an effect,
   * which meant a setState, which meant another render. An infinite loop,
   * and React said so.
   *
   * The page objects inside come from react-query's cache and ARE stable, so
   * an element-wise check is enough to know nothing actually changed.
   */
  const stableFiles = useRef<Array<Files.FileInfo>>([]);
  const files: Array<Files.FileInfo> = useMemo(() => {
    const next = concatenatedResults ?? [];
    const previous = stableFiles.current;
    if (
      previous.length === next.length &&
      previous.every((file, at) => file === next[at])
    ) {
      return previous;
    }
    stableFiles.current = next;
    return next;
  }, [concatenatedResults]);

  const selectedFileDict: SelectFileDictType = React.useMemo(() => {
    const result: SelectFileDictType = {};
    const selectedDict: SelectFileDictType = {};
    selectedFiles.forEach((file) => {
      selectedDict[file.path ?? ''] = true;
    });
    concatenatedResults?.forEach((file) => {
      result[file.path ?? ''] = selectedDict[file.path ?? ''] ?? false;
    });
    return result;
  }, [selectedFiles, concatenatedResults]);

  // What select-all selects: the rows a box would appear on, judged by the
  // same rule, so the header can never claim files the boxes refuse.
  const selectableFiles = useMemo(
    () => files.filter((file) => canSelectFile(file, selectMode)),
    [files, selectMode]
  );

  const prependColumns = selectMode?.types?.length
    ? [
        {
          Header: (
            <FileSelectHeader
              onSelectAll={() => onSelect && onSelect(selectableFiles)}
              onUnselectAll={() =>
                onUnselect && onUnselect(concatenatedResults ?? [])
              }
              selectedFileDict={selectedFileDict}
            />
          ),
          id: 'multiselect',
          Cell: (el: React.PropsWithChildren<CellProps<{}, any>>) => (
            <FileListingCheckboxCell
              selected={
                selectedFileDict[(el.row.original as Files.FileInfo).path ?? '']
              }
            />
          ),
        },
      ]
    : [];

  /**
   * Shift-click: take the whole run, rather than toggling each file in it.
   * Toggling a run flips the ones already picked back off, which is not what
   * dragging a selection across a list has ever meant.
   */
  const selectRange = useCallback(
    (range: Array<Files.FileInfo>) => {
      const allowed = range.filter((file) => canSelectFile(file, selectMode));
      if (allowed.length && onSelect) onSelect(allowed);
    },
    [selectMode, onSelect]
  );

  const fileSelectCallback = useCallback(
    (file: Files.FileInfo) => {
      if (!canSelectFile(file, selectMode)) {
        return;
      }
      if (selectedFileDict[file.path ?? ''] && onUnselect) {
        onUnselect([file]);
      } else {
        onSelect && onSelect([file]);
      }
    },
    [selectMode, onUnselect, selectedFileDict, onSelect]
  );

  // Maps rows to row properties, such as classNames
  const getRowProps = (row: Row) => {
    const file: Files.FileInfo = row.original as Files.FileInfo;
    return {
      onClick: () => fileSelectCallback(file),
      'data-testid': file.name,
      className: selectedFileDict[file.path ?? ''] ? styles.selected : '',
    };
  };

  // Missing credentials, an unreachable host and a path that is not there are
  // the failures you actually meet browsing systems, and none of them is a
  // fault in the UI's sense. They get an explanation and a way forward;
  // everything else keeps the error block.
  const message = (error as Error)?.message;
  const explanation = explainFilesError(message);

  // The listing is not mounted on an explanation page, and with it goes the
  // keyboard model — so ← and ⌫ would stop working at exactly the moment you
  // most want them: standing in a directory you cannot read.
  // …unless V2 is mounted with it, in which case the table's own handler has
  // ← and ⌫ already and two of them would climb two directories per press.
  useBackKeys(
    onBack,
    Boolean(explanation) && keyboard !== false && variant !== 'v2'
  );

  /**
   * The explanation goes inside the explorer, not instead of it.
   *
   * A directory you cannot read used to replace the whole table. That threw
   * away everything that still worked — the column header, the row count,
   * the density switches — to say one sentence, and it made a refused
   * directory feel like a broken page rather than one door among many that
   * happens to be locked. V2 hosts it where the rows go; the classic table
   * has nowhere to put it and still stands in for the listing.
   */
  const problem = explanation ? (
    <FilesErrorPanel
      systemId={systemId}
      explanation={explanation}
      message={message}
      path={path}
      onUp={onUp}
      onTop={onTop}
      inline
    />
  ) : undefined;

  if (explanation && variant !== 'v2') {
    return (
      <FilesErrorPanel
        systemId={systemId}
        explanation={explanation}
        message={message}
        path={path}
        onUp={onUp}
        onTop={onTop}
      />
    );
  }

  return (
    <QueryWrapper
      // V2 draws its own waiting state, in the rows, with the table around
      // them already on screen — QueryWrapper's spinner replaces the lot and
      // makes every directory open with a flash of nothing.
      isLoading={variant === 'v2' ? false : isLoading}
      // an explanation we are showing ourselves is not an error to print
      // again — QueryWrapper's block would replace the explorer, which is
      // the whole thing this stopped doing
      error={problem ? null : error}
      className={className}
    >
      {viewing && (
        <FileViewerPanel
          systemId={systemId}
          file={viewing}
          path={path}
          onClose={() => setViewing(undefined)}
          onRenamed={() => setViewing(undefined)}
          onStep={step}
          onUnavailable={unavailable(viewing)}
          hasPrevious={viewingAt > 0}
          hasNext={viewingAt >= 0 && viewingAt < readable.length - 1}
        />
      )}
      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={9000}
        onClose={() => setNotice(undefined)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {/* Soft on purpose. This is a fact about one file, not a fault in
            the page — a red banner would say the listing had broken. */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            alignItems: 'flex-start',
            maxWidth: '52ch',
            p: 1.25,
            border: '1px solid',
            borderColor: '#e6d3ae',
            borderRadius: 1,
            bgcolor: '#fdf8ec',
            boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
          }}
        >
          <LockOutlined sx={{ fontSize: 17, color: '#a35c00', mt: '1px' }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 600 }}>
              {notice?.title}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.73rem',
                color: 'text.secondary',
                lineHeight: 1.5,
              }}
            >
              {notice?.detail}
            </Typography>
          </Box>
          <Box
            component="button"
            type="button"
            aria-label="Dismiss"
            onClick={() => setNotice(undefined)}
            sx={{
              border: 'none',
              background: 'none',
              p: 0.25,
              lineHeight: 0,
              cursor: 'pointer',
              color: 'text.secondary',
              borderRadius: '4px',
              '& svg': { fontSize: 15, display: 'block' },
              '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' },
            }}
          >
            <CloseRounded />
          </Box>
        </Box>
      </Snackbar>
      {variant === 'v2' ? (
        <FilesDropZone
          systemId={systemId}
          path={path}
          enabled={dropToUpload}
          onFiles={onDropFiles}
        >
          <FileListingTableV2
            files={files}
            selectedPaths={selectedFileDict}
            onToggleSelect={fileSelectCallback}
            onSelectRange={selectRange}
            onSelectAll={() => onSelect && onSelect(selectableFiles)}
            onUnselectAll={() =>
              onUnselect && onUnselect(concatenatedResults ?? [])
            }
            onInfiniteScroll={infiniteScrollCallback}
            isLoading={isFetchingNextPage}
            isInitialLoading={isLoading}
            problem={problem}
            location={location}
            openOn={openOn}
            onNavigate={onNavigate}
            onView={setViewing}
            viewingPath={viewing?.path}
            onOrderChange={setOrder}
            onBack={onBack}
            keyboard={keyboard}
            currentHint={cameFrom}
            total={total}
            hasMore={Boolean(hasNextPage)}
            fields={fields}
            selectMode={selectMode}
            density={density}
            details={details}
            className={className}
          />
        </FilesDropZone>
      ) : (
        <FileListingTable
          files={files}
          prependColumns={prependColumns}
          onInfiniteScroll={infiniteScrollCallback}
          isLoading={isFetchingNextPage}
          getRowProps={getRowProps}
          location={location}
          onNavigate={onNavigate}
          fields={fields}
          selectMode={selectMode}
        />
      )}
    </QueryWrapper>
  );
};

export default FileListing;
