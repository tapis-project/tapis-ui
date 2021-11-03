import { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from 'reactstrap';
import { GenericModal } from 'tapis-ui/_common';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { ToolbarModalProps } from '../Toolbar';
import { useMove } from 'tapis-hooks/files';
import { focusManager } from 'react-query';
import { useDropzone } from 'react-dropzone';
import styles from './UploadModal.module.scss';
import { FileListingTable } from 'tapis-ui/components/files/FileListing';
import File from '@tapis/tapis-typescript-files';
import { Column } from 'react-table';

const UploadModal: React.FC<ToolbarModalProps> = ({
  toggle,
  path,
  systemId,
}) => {
  const [files, setFiles] = useState<Array<File>>([]);

  const onDrop = useCallback(
    (selectedFiles: Array<File>) => {
      const uniqueFiles = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        if (fileIsUnique(files, selectedFiles[i])) {
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

  const { move, isLoading, error, isSuccess, reset } = useMove();

  useEffect(() => {
    reset();
  }, [reset]);

  const onSubmit = () => {
    console.log(files);
  };

  const fileIsUnique = (filesArr: Array<File>, file: File) => {
    for (let i = 0; i < filesArr.length; i++) {
      if (filesArr[i].name === file.name) {
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
            onClick={() => {
              console.log('Removed index: ', el.row.index);
              removeFile(el.row.index);
            }}
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
            <div>or drag and drop</div>
          </div>
          <h3 className={styles['files-list-header']}>
            Uploading to {systemId}/{path}
          </h3>
          {error && <p className={styles['upload-error']}>{error}</p>}
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
