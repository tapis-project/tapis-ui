import { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from 'reactstrap';
import { GenericModal } from 'tapis-ui/_common';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { ToolbarModalProps } from '../Toolbar';
import { useUpload } from 'tapis-hooks/files';
import { focusManager } from 'react-query';
import { useDropzone } from 'react-dropzone';
import styles from './UploadModal.module.scss';
import { FileListingTable } from 'tapis-ui/components/files/FileListing';
import File from '@tapis/tapis-typescript-files';
import { Column } from 'react-table';
import sizeFormat from 'utils/sizeFormat';

type UploadModalProps = ToolbarModalProps & {
  maxFileSizeBytes?: number
}

const UploadModal: React.FC<UploadModalProps> = ({
  toggle,
  path,
  systemId,
  maxFileSizeBytes = 524288000
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

  const removeFile = useCallback(
    (index: number) => {
      const modifiedFiles = files;
      modifiedFiles.splice(index, 1);
      setFiles([...modifiedFiles]);
    },
    [files]
  );

  const onSuccess = useCallback(() => {
    // Calling the focus manager triggers react-query's
    // automatic refetch on window focus
    focusManager.setFocused(true);
  }, []);

  const { upload, isLoading, error, isSuccess, reset } = useUpload();

  useEffect(() => {
    reset();
  }, [reset]);

  const onSubmit = () => {
    upload(systemId!, path!, files[0])
  };

  const isValidFile = (filesArr: Array<File>, file: File) => {
    for (let i = 0; i < filesArr.length; i++) {
      if (filesArr[i].name === file.name || file.size > maxFileSizeBytes) {
        return false;
      }
    }

    return true;
  };

  const filesToFileInfo = (filesArr: Array<File>): Array<File.FileInfo> => {
    return filesArr.map((file) => {
      return { name: file.name, size: file.size, type: 'file' };
    });
  };

  const appendColumns: Array<Column> = [
    {
      Header: '',
      accessor: '-',
      Cell: (el) => {
        return (
          <span
            className={styles['remove-file']}
            onClick={() => removeFile(el.row.index)}
          >
            &#x2715;
          </span>
        );
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
          success={isSuccess ? `Successfully uploaded files` : ''}
          reverse={true}
        >
          <Button
            color="primary"
            disabled={isLoading || isSuccess || files.length === 0}
            aria-label="Submit"
            onClick={onSubmit}
          >
            Upload
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default UploadModal;
