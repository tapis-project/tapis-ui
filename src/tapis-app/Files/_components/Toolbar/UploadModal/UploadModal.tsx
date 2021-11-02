import { useEffect, useState, useCallback } from 'react';
import { Button, Input } from 'reactstrap';
import { GenericModal } from 'tapis-ui/_common';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { ToolbarModalProps } from '../Toolbar';
import { useForm } from 'react-hook-form';
import { useMove } from 'tapis-hooks/files';
import { focusManager } from 'react-query';
import { useDropzone } from 'react-dropzone';
import styles from './UploadModal.module.scss'

const UploadModal: React.FC<ToolbarModalProps> = ({ toggle, path }) => {
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
    [files]
  );

  const {
    getRootProps,
    getInputProps
  } = useDropzone({
    onDrop
  });

  const onSuccess = useCallback(() => {
    // Calling the focus manager triggers react-query's
    // automatic refetch on window focus
    focusManager.setFocused(true);
  }, []);

  const { move, isLoading, error, isSuccess, reset } = useMove();

  useEffect(() => {
    reset();
  }, [reset]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { ref: filesRef, ...filesFieldProps } = register('files', {
    required: 'Must select at least one file for upload',
  });

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

  return (
    <GenericModal
      toggle={toggle}
      title={`Upload files`}
      body={
        <div>
          <form id="upload-form" onSubmit={handleSubmit(onSubmit)}>
            <div className={styles["file-dropzone"]} {...getRootProps()}>
              <input ref={filesRef} {...filesFieldProps} {...getInputProps()} />
              <Button>Select files</Button>
              <div>or drag and drop</div>
            </div>
          </form>
          <h3>Uploading to '/{path}'</h3>
          <div className={styles["files-list"]}>
            {files.length > 0 ? (
              <div>
                {files.map((item) => {
                  return (
                    <div key={item.name}>
                      {item.name} {(item.size / 10000).toFixed(2)}mb
                    </div>
                  );
                })}
              </div>
            ) : <p>No files selected</p>
            }
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
            form="upload-form"
            color="primary"
            disabled={isLoading || isSuccess || files.length === 0}
            aria-label="Submit"
          >
            Upload
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default UploadModal;
