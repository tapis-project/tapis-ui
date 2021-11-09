import { useEffect, useState, useCallback, useReducer } from 'react';
import { Button } from 'reactstrap';
import { GenericModal, LoadingSpinner, Icon } from 'tapis-ui/_common';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { ToolbarModalProps } from '../Toolbar';
import { useUpload } from 'tapis-hooks/files';
import { focusManager } from 'react-query';
import { useDropzone } from 'react-dropzone';
import styles from './UploadModal.module.scss';
import { FileListingTable } from 'tapis-ui/components/files/FileListing';
import { Files } from '@tapis/tapis-typescript';
import { Column } from 'react-table';
import sizeFormat from 'utils/sizeFormat';
import { useMutations } from 'tapis-hooks/utils';
import { InsertHookParams } from 'tapis-hooks/files/useUpload';

export enum FileOpEventStatus {
  loading = 'loading',
  error = 'error',
  success = 'success',
}

export type FileOpState = {
  [key: string]: FileOpEventStatus;
};

type UploadModalProps = ToolbarModalProps & {
  maxFileSizeBytes?: number;
};

const UploadModal: React.FC<UploadModalProps> = ({
  toggle,
  path,
  systemId,
  maxFileSizeBytes = 524288000,
}) => {
  const [files, setFiles] = useState<Array<File>>([]);

  const onDrop = useCallback(
    (selectedFiles: Array<File>) => {
      const uniqueFiles = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        if (isValidFile(files, selectedFiles[i])) {
          uniqueFiles.push(selectedFiles[i]);
        }
      }

      setFiles([...files, ...uniqueFiles]);
    },
    [files, setFiles]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
  });

  const reducer = (
    state: FileOpState,
    action: { key: string; status: FileOpEventStatus }
  ) => ({ ...state, [action.key]: action.status });

  const [fileOpState, dispatch] = useReducer(reducer, {} as FileOpState);

  const onComplete = useCallback(() => {
    // Calling the focus manager triggers react-query's
    // automatic refetch on window focus
    focusManager.setFocused(true);
  }, []);

  const removeFile = useCallback(
    (file: Files.FileInfo) => {
      setFiles([...files.filter((checkFile) => file.name !== checkFile.name)]);
      if (files.length === 1) {
        toggle();
      }
    },
    [files, setFiles, toggle]
  );

  const { uploadAsync, isLoading, error, isSuccess, reset } = useUpload();

  const { run } = useMutations<InsertHookParams, Files.FileStringResponse>({
    fn: uploadAsync,
    onStart: (item) => {
      dispatch({ key: item.file.name!, status: FileOpEventStatus.loading });
    },
    onSuccess: (item) => {
      dispatch({ key: item.file.name!, status: FileOpEventStatus.success });
    },
    onError: (item) => {
      dispatch({ key: item.file.name!, status: FileOpEventStatus.error });
    },
    onComplete,
  });

  useEffect(() => {
    reset();
  }, [reset]);

  // const onSubmit = () => {
  //   files.map((file) => {
  //     uploadAsync({systemId: systemId!, path: (path || "/"), file});
  //   })
  // };

  const onSubmit = useCallback(() => {
    const operations: Array<InsertHookParams> = files.map((file) => ({
      systemId: systemId!,
      path: path!,
      file,
    }));
    run(operations);
  }, [files, run, systemId]);

  const isValidFile = (filesArr: Array<File>, file: File) => {
    for (let i = 0; i < filesArr.length; i++) {
      if (filesArr[i].name === file.name || file.size > maxFileSizeBytes) {
        return false;
      }
    }

    return true;
  };

  const filesToFileInfo = (filesArr: Array<File>): Array<Files.FileInfo> => {
    return filesArr.map((file) => {
      return { name: file.name, size: file.size, type: 'file' };
    });
  };

  const statusColumn: Array<Column> = [
    {
      Header: '',
      id: 'deleteStatus',
      Cell: (el) => {
        const file = files[el.row.index];
        switch (fileOpState[file.name!]) {
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
                  removeFile(filesToFileInfo(files)[el.row.index]);
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
      title={`Upload files`}
      body={
        <div>
          <div className={styles['file-dropzone']} {...getRootProps()}>
            <input {...getInputProps()} />
            <Button>Select files</Button>
            <div>
              <p>or drag and drop</p>
              <b>Max file size: {sizeFormat(maxFileSizeBytes)}</b>
            </div>
          </div>
          <h3 className={styles['files-list-header']}>
            Uploading to {systemId}/{path}
          </h3>
          {error && <p className={styles['upload-error']}>{error.message}</p>}
          <div className={styles['files-list-container']}>
            <FileListingTable
              files={filesToFileInfo(files)}
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
          success={isSuccess ? `Successfully uploaded files` : ''}
          reverse={true}
        >
          <Button
            color="primary"
            disabled={isLoading || isSuccess || files.length === 0}
            aria-label="Submit"
            onClick={onSubmit}
          >
            {!isLoading ? (
              'Upload'
            ) : (
              <span>
                <LoadingSpinner placement="inline" />
                Uploading
              </span>
            )}
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default UploadModal;
