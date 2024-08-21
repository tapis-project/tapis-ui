import { useCallback, useState } from 'react';
import { Button } from 'reactstrap';
import { GenericModal, Breadcrumbs } from '@tapis/tapisui-common';
import { SubmitWrapper } from '@tapis/tapisui-common';
import { breadcrumbsFromPathname } from '@tapis/tapisui-common';
import { FileListingTable } from '@tapis/tapisui-common';
import { FileOperationStatus } from '../_components';
import { FileExplorer } from '@tapis/tapisui-common';
import { ToolbarModalProps } from '../Toolbar';
import { useLocation } from 'react-router-dom';
import { focusManager } from 'react-query';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import { Files } from '@tapis/tapis-typescript';
import { Column } from 'react-table';
import styles from './MoveCopyModal.module.scss';
import { useFilesSelect } from '../../FilesContext';
import { useFileOperations } from '../_hooks';

type MoveCopyHookParams = {
  systemId: string;
  path: string;
  newPath: string;
};

type MoveCopyModalProps = {
  operation: Files.MoveCopyRequestOperationEnum;
} & ToolbarModalProps;

const MoveCopyModal: React.FC<MoveCopyModalProps> = ({
  toggle,
  systemId = '',
  path = '/',
  operation,
}) => {
  const { pathname } = useLocation();
  const [destinationPath, setDestinationPath] = useState<string | null>(path);
  const { selectedFiles, unselect } = useFilesSelect();

  const opFormatted = operation.charAt(0) + operation.toLowerCase().slice(1);

  const { copyAsync } = Hooks.useCopy();
  const { moveAsync } = Hooks.useMove();
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

  const removeFile = useCallback(
    (file: Files.FileInfo) => {
      unselect([file]);
      if (selectedFiles.length === 1) {
        toggle();
      }
    },
    [selectedFiles, toggle, unselect]
  );

  const { run, state, isLoading, isFinished, isSuccess, error } =
    useFileOperations<MoveCopyHookParams, Files.FileStringResponse>({
      fn,
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
        const path = (el.row.original as Files.FileInfo).path!;
        if (!state[path]) {
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
        return <FileOperationStatus status={state[path].status} />;
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
        <FileExplorer
          systemId={systemId}
          path={path}
          onNavigate={onNavigate}
          fields={['size']}
          className={styles['file-list']}
        />
      </div>
    </div>
  );

  const footer = (
    <SubmitWrapper
      isLoading={isLoading}
      error={error}
      success={
        isSuccess
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
          isLoading ||
          (isFinished && !error)
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

export default MoveCopyModal;
