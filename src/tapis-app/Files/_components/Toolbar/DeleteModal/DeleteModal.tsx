import { useEffect, useCallback, useReducer } from 'react';
import { Button } from 'reactstrap';
import { GenericModal, Icon, LoadingSpinner } from 'tapis-ui/_common';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { FileListingTable } from 'tapis-ui/components/files/FileListing/FileListing';
import { ToolbarModalProps } from '../Toolbar';
import { focusManager } from 'react-query';
import { useDelete } from 'tapis-hooks/files';
import { Column } from 'react-table';
import styles from './DeleteModal.module.scss';
import { useFilesSelect } from '../../FilesContext';
import { Files } from '@tapis/tapis-typescript';
import { useMutations } from 'tapis-hooks/utils';
import { DeleteHookParams } from 'tapis-hooks/files/useDelete';

enum FileOpEventStatus {
  loading = 'loading',
  error = 'error',
  success = 'success',
}

type DeleteState = {
  [path: string]: FileOpEventStatus;
};

const DeleteModal: React.FC<ToolbarModalProps> = ({
  toggle,
  systemId = '',
  path = '/',
}) => {
  const { selectedFiles, unselect } = useFilesSelect();
  const { deleteFileAsync, isSuccess, isLoading, error, reset } = useDelete();

  const reducer = (
    state: DeleteState,
    action: { path: string; status: FileOpEventStatus }
  ) => ({ ...state, [action.path]: action.status });

  const [deleteState, dispatch] = useReducer(reducer, {} as DeleteState);

  useEffect(() => {
    reset();
  }, [reset]);

  const onComplete = useCallback(() => {
    // Calling the focus manager triggers react-query's
    // automatic refetch on window focus
    focusManager.setFocused(true);
  }, []);

  const { run } = useMutations<DeleteHookParams, Files.FileStringResponse>({
    fn: deleteFileAsync,
    onStart: (item) => {
      dispatch({ path: item.path!, status: FileOpEventStatus.loading });
    },
    onSuccess: (item) => {
      dispatch({ path: item.path!, status: FileOpEventStatus.success });
    },
    onError: (item) => {
      dispatch({ path: item.path!, status: FileOpEventStatus.error });
    },
    onComplete,
  });

  const onSubmit = useCallback(() => {
    const operations: Array<DeleteHookParams> = selectedFiles.map((file) => ({
      systemId,
      path: file.path!,
    }));
    run(operations);
  }, [selectedFiles, run, systemId]);

  const removeFile = useCallback(
    (file: Files.FileInfo) => {
      unselect([file]);
      if (selectedFiles.length === 1) {
        toggle();
      }
    },
    [selectedFiles, toggle, unselect]
  );

  const statusColumn: Array<Column> = [
    {
      Header: '',
      id: 'copyStatus',
      Cell: (el) => {
        const file = selectedFiles[el.row.index];
        switch (deleteState[file.path!]) {
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

  return (
    <GenericModal
      toggle={toggle}
      title={`Delete files and folders`}
      body={
        <div>
          <h3>
            {systemId}/{path}
          </h3>
          <div className={styles['files-list-container']}>
            <FileListingTable
              files={selectedFiles}
              fields={['size']}
              appendColumns={statusColumn}
              className={styles['file-list-table']}
            />
          </div>
        </div>
      }
      footer={
        <SubmitWrapper
          isLoading={false}
          error={error}
          success={isSuccess ? `Successfully deleted files` : ''}
          reverse={true}
        >
          <Button
            color="primary"
            disabled={isLoading || isSuccess || selectedFiles.length === 0}
            aria-label="Submit"
            onClick={onSubmit}
          >
            Confirm delete ({selectedFiles.length})
          </Button>
          {!isSuccess && (
            <Button
              color="danger"
              disabled={isLoading || isSuccess || selectedFiles.length === 0}
              aria-label="Cancel"
              onClick={() => {
                toggle();
              }}
            >
              Cancel
            </Button>
          )}
        </SubmitWrapper>
      }
    />
  );
};

export default DeleteModal;
