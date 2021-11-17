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

const CopyMoveModal: React.FC<CopyMoveModalProps> = ({
  toggle,
  systemId = '',
  path = '/',
  operation,
}) => {
  const { pathname } = useLocation();
  const [copyMoveError, setCopyMoveError] = useState<Error | null>(null);
  const [destinationPath, setDestinationPath] = useState<string | null>(path);
  const { selectedFiles, unselect } = useFilesSelect();

  const opFormatted = operation.charAt(0) + operation.toLowerCase().slice(1);

  type CopyMoveState = {
    [path: string]: string;
  };
  const reducer = (
    state: CopyMoveState,
    action: { path: string; icon: string }
  ) => {
    return {
      ...state,
      [action.path]: action.icon,
    };
  };
  const [copyMoveState, dispatch] = useReducer(reducer, {} as CopyMoveState);

  const { copyAsync } = useCopy();
  const { moveAsync } = useMove();
  const fn =
    operation === Files.MoveCopyRequestOperationEnum.Copy
      ? copyAsync
      : moveAsync;

  const onFileCopyMoveSuccess = useCallback(
    (operation: MoveCopyHookParams, _: Files.FileStringResponse) => {
      dispatch({ path: operation.path, icon: 'approved-reverse' });
    },
    [dispatch]
  );
  const onFileCopyMoveError = useCallback(
    (operation: MoveCopyHookParams, error: Error) => {
      dispatch({ path: operation.path, icon: 'alert' });
      setCopyMoveError(error);
    },
    [dispatch, setCopyMoveError]
  );
  const onFileCopyMoveStart = useCallback(
    (operation: MoveCopyHookParams) => {
      dispatch({ path: operation.path, icon: 'loading' });
    },
    [dispatch]
  );
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

  const removeFile = useCallback(
    (file: Files.FileInfo) => {
      unselect([file]);
      if (selectedFiles.length === 1) {
        toggle();
      }
    },
    [selectedFiles, toggle, unselect]
  );

  const { run, isRunning, isFinished } = useMutations<
    MoveCopyHookParams,
    Files.FileStringResponse
  >({
    fn,
    onSuccess: onFileCopyMoveSuccess,
    onError: onFileCopyMoveError,
    onStart: onFileCopyMoveStart,
    onComplete,
  });

  const onSubmit = useCallback(() => {
    const operations: Array<MoveCopyHookParams> = selectedFiles.map((file) => ({
      systemId,
      newPath: `${destinationPath!}/${file.name!}`,
      path: file.path!,
    }));
    run(operations);
  }, [selectedFiles, run, destinationPath, systemId]);

  const statusColumns: Array<Column> = [
    {
      Header: '',
      id: 'moveCopyStatus',
      Cell: (el) => {
        const path = (el.row.original as Files.FileInfo).path;
        const status = path && copyMoveState[path];
        if (status) {
          if (status === 'loading') {
            return <LoadingSpinner placement="inline" />;
          }
          return <Icon name={status} />;
        }
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
      isLoading={isRunning}
      error={copyMoveError}
      success={
        isFinished && !copyMoveError
          ? 'Successfully ' +
            (operation === Files.MoveCopyRequestOperationEnum.Move
              ? 'moved'
              : 'copied') +
            ' files'
          : ''
      }
      reverse={true}
    >
      <Button
        color="primary"
        disabled={
          !destinationPath ||
          destinationPath === path ||
          isRunning ||
          (isFinished && !copyMoveError)
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
