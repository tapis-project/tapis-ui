import { useCallback, useState, useReducer } from 'react';
import { Button } from 'reactstrap';
import {
  GenericModal,
  Breadcrumbs,
  Icon,
  LoadingSpinner,
} from 'tapis-ui/_common';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import breadcrumbsFromPathname from 'tapis-ui/_common/Breadcrumbs/breadcrumbsFromPathname';
import { FileListingTable } from 'tapis-ui/components/files/FileListing/FileListing';
import { FileExplorer } from '../_components';
import { ToolbarModalProps } from '../Toolbar';
import { useLocation } from 'react-router';
import { focusManager } from 'react-query';
import { useCopy, useMove } from 'tapis-hooks/files';
import { MoveCopyHookParams } from 'tapis-hooks/files';
import { Files } from '@tapis/tapis-typescript';
import { useMutations } from 'tapis-hooks/utils';
import { Column } from 'react-table';
import styles from './CopyMoveModal.module.scss';
import { useFilesSelect } from '../../FilesContext';

type CopyMoveModalProps = {
  operation: Files.MoveCopyRequestOperationEnum;
} & ToolbarModalProps;

export enum FileOpEventStatus {
  loading = 'loading',
  error = 'error',
  success = 'success',
  progress = 'progress',
}

export type FileOpState = {
  [key: string]: FileOpEventStatus;
};

const CopyMoveModal: React.FC<CopyMoveModalProps> = ({
  toggle,
  systemId = '',
  path = '/',
  operation,
}) => {
  const { pathname } = useLocation();
  const [destinationPath, setDestinationPath] = useState<string | null>(path);
  const { selectedFiles, unselect } = useFilesSelect();

  // Capitalized form of the operation name
  const opFormatted = operation.charAt(0) + operation.slice(1).toLowerCase();

  const reducer = (
    state: FileOpState,
    action: { key: string; status: FileOpEventStatus }
  ) => ({ ...state, [action.key]: action.status });

  const [copyMoveState, dispatch] = useReducer(reducer, {} as FileOpState);

  const {
    copyAsync,
    error: copyError,
    isLoading: moveIsLoading,
    isSuccess: moveIsSuccess,
  } = useCopy();
  const {
    moveAsync,
    error: moveError,
    isLoading: copyIsLoading,
    isSuccess: copyIsSuccess,
  } = useMove();

  const error =
    operation === Files.MoveCopyRequestOperationEnum.Move
      ? moveError
      : copyError;
  const isLoading =
    operation === Files.MoveCopyRequestOperationEnum.Move
      ? moveIsLoading
      : copyIsLoading;
  const isSuccess =
    operation === Files.MoveCopyRequestOperationEnum.Move
      ? moveIsSuccess
      : copyIsSuccess;

  const fn =
    operation === Files.MoveCopyRequestOperationEnum.Copy
      ? copyAsync
      : moveAsync;

  const onComplete = useCallback(() => {
    // Calling the focus manager triggers react-query's
    // automatic refetch on window focus
    focusManager.setFocused(true);
  }, []);

  const onNavigate = useCallback(
    (_: string | null, path: string | null) => {
      setDestinationPath(path);
    },
    [setDestinationPath]
  );

  const { run } = useMutations<MoveCopyHookParams, Files.FileStringResponse>({
    fn,
    onStart: (item) => {
      dispatch({ key: item.path!, status: FileOpEventStatus.loading });
    },
    onSuccess: (item) => {
      dispatch({ key: item.path!, status: FileOpEventStatus.success });
    },
    onError: (item) => {
      dispatch({ key: item.path!, status: FileOpEventStatus.error });
    },
    onComplete,
  });

  const onSubmit = useCallback(() => {
    const operations: Array<MoveCopyHookParams> = selectedFiles.map((file) => ({
      systemId,
      newPath: destinationPath!,
      path: file.path!,
    }));
    run(operations);
  }, [selectedFiles, run, destinationPath, systemId]);

  const removeFile = useCallback(
    (file: Files.FileInfo) => {
      unselect([file]);
      if (selectedFiles.length === 1) {
        toggle();
      }
    },
    [selectedFiles, toggle, unselect]
  );

  const statusColumns: Array<Column> = [
    {
      Header: '',
      id: 'deleteStatus',
      Cell: (el) => {
        const file = selectedFiles[el.row.index];
        switch (copyMoveState[file.path!]) {
          case 'loading':
            return <LoadingSpinner placement="inline" />;
          case 'success':
            return <Icon name="approved-reverse" />;
          case 'error':
            return <Icon name="alert" />;
          case undefined:
            return (
              <span
                className={styles['remove-file']}
                onClick={() => {
                  removeFile(selectedFiles[el.row.index]);
                }}
              >
                &#x2715;
              </span>
            );
        }
      },
    },
  ];

  const body = (
    <div className="row h-100">
      <div className="col-md-6 d-flex flex-column">
        {/* Table of selected files */}
        <div className={`${styles['col-header']}`}>
          {`${
            operation === Files.MoveCopyRequestOperationEnum.Copy
              ? 'Copying '
              : 'Moving '
          }`}
          {selectedFiles.length} files
        </div>
        <Breadcrumbs
          breadcrumbs={[
            ...breadcrumbsFromPathname(pathname)
              .splice(1)
              .map((fragment) => ({ text: fragment.text })),
          ]}
        />
        <div className={styles['nav-list']}>
          <FileListingTable
            files={selectedFiles}
            className={`${styles['file-list-origin']} `}
            fields={['size']}
            appendColumns={statusColumns}
          />
        </div>
      </div>
      <div className="col-md-6 d-flex flex-column">
        {/* Table of selected files */}
        <div className={`${styles['col-header']}`}>Destination</div>
        <FileExplorer systemId={systemId} path={path} onNavigate={onNavigate} />
      </div>
    </div>
  );

  const footer = (
    <SubmitWrapper
      isLoading={isLoading}
      error={error}
      success={
        isSuccess && !error
          ? 'Successfully ' +
            (operation === Files.MoveCopyRequestOperationEnum.Move
              ? 'moved'
              : 'copied')
          : ''
      }
      reverse={true}
    >
      <Button
        color="primary"
        disabled={
          !destinationPath ||
          destinationPath === path ||
          isLoading ||
          isSuccess ||
          !!error
        }
        aria-label="Submit"
        type="submit"
        onClick={onSubmit}
      >
        {opFormatted}
      </Button>
    </SubmitWrapper>
  );

  return (
    <GenericModal
      toggle={toggle}
      title={`${opFormatted} Files`}
      size="xl"
      body={body}
      footer={footer}
    />
  );
};

export default CopyMoveModal;
