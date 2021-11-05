import { useEffect, useCallback, useState } from 'react';
import { Button } from 'reactstrap';
import {
  GenericModal,
  Breadcrumbs,
  Icon,
  LoadingSpinner,
} from 'tapis-ui/_common';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { FileListingTable } from 'tapis-ui/components/files/FileListing/FileListing';
import { ToolbarModalProps } from '../Toolbar';
import { focusManager } from 'react-query';
import { useDelete } from 'tapis-hooks/files';
import { Column } from 'react-table';
import styles from './DeleteModal.module.scss';
import { useFilesSelect } from '../../FilesContext';

const CopyMoveModal: React.FC<ToolbarModalProps> = ({
  toggle,
  systemId = '',
  path,
}) => {
  const { selectedFiles, unselect } = useFilesSelect();

  const { _delete, isSuccess, isLoading, error, reset } = useDelete()

  useEffect(() => {
    reset();
  }, [reset]);

  const onSubmit = () => {
    console.log(selectedFiles)
  }

  const removeFile = useCallback(
    (index: number) => {
      unselect([selectedFiles[index]]);
    },
    [selectedFiles]
  );

  const onSuccess = useCallback(() => {
    // Calling the focus manager triggers react-query's
    // automatic refetch on window focus
    focusManager.setFocused(true);
  }, []);

  useEffect(() => {
    reset();
  }, [reset]);


  const appendColumns: Array<Column> = [
    {
      Header: '',
      accessor: '-',
      Cell: (el) => {
        return (
          <span
            className={styles['remove-file']}
            onClick={() => {console.log(el);removeFile(el.row.index)}}
          >
            &#x2715;
          </span>
        );
      },
    },
  ];

  return (
    <GenericModal
      toggle={() => {toggle(); unselect(selectedFiles)}}
      title={`Delete files and folders`}
      body={
        <div>
          <h3>{systemId}/{path}</h3>
          <div className={styles['files-list-container']}>
            <FileListingTable
              files={selectedFiles}
              fields={['size']}
              appendColumns={appendColumns}
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
            Delete
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default CopyMoveModal;
