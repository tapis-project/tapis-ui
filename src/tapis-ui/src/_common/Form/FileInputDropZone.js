import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import './FileInputDropZone.scss';

function RejectedFileMessage({ numberOfFiles }) {
  if (numberOfFiles === 0) {
    return null;
  }

  return (
    <span className="rejected-file-message text-danger">
      One or more of your files exceeds the maximum size for an upload and were
      not attached.
    </span>
  );
}

RejectedFileMessage.propTypes = {
  numberOfFiles: PropTypes.number.isRequired,
};

/**
 * FileInputDropZone is a component where users can select files via file browser or by
 * drag/drop.  an area to drop files. If `file` property is set then files are listed
 * and user can manage (e.g. delete those files) directly in this component.
 */
function FileInputDropZone({
  files,
  onSetFiles,
  onRejectedFiles,
  maxSize,
  maxSizeMessage,
  onRemoveFile,
  isSubmitted,
}) {
  const [numberRejectedFiles, setNumberRejectedFiles] = useState(0);

  const { getRootProps, open, getInputProps } = useDropzone({
    noClick: true,
    maxSize,
    onDrop: (accepted) => {
      onSetFiles(accepted);
      setNumberRejectedFiles(0);
    },
    onDropRejected: (rejected) => {
      if (onRejectedFiles) {
        onRejectedFiles(rejected);
      }
      setNumberRejectedFiles(rejected.length);
    },
  });

  const removeFile = (fileIndex) => {
    if (onRemoveFile) {
      onRemoveFile(fileIndex);
      setNumberRejectedFiles(0);
    }
  };

  const showFileList = files && files.length > 0;

  if (isSubmitted && numberRejectedFiles > 0) {
    // reset number of rejected files when files is submitted
    setNumberRejectedFiles(0);
  }

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <div {...getRootProps()} className="dropzone-area">
      <input {...getInputProps()} />
      {!showFileList && (
        <div className="no-attachment-view">
          <i className="icon-upload" />
          <br />
          {files && <RejectedFileMessage numberOfFiles={numberRejectedFiles} />}
          <Button outline onClick={open} className="select-files-button">
            Select File(s)
          </Button>
          <strong>or</strong>
          <strong>Drag and Drop</strong>
          <br />
          {maxSizeMessage}
        </div>
      )}
      {showFileList && (
        <div className="attachment-view">
          <div className="attachment-list">
            {files.map((f, i) => (
              <div className="attachment-block" key={[f.name, i].toString()}>
                <span className="d-inline-block text-truncate">{f.name}</span>
                <Button
                  color="link"
                  className="attachment-remove"
                  onClick={() => {
                    setNumberRejectedFiles(0);
                    removeFile(i);
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <RejectedFileMessage numberOfFiles={numberRejectedFiles} />
          <Button outline onClick={open} className="select-files-button">
            Select File(s)
          </Button>
        </div>
      )}
    </div>
  );
}

FileInputDropZone.propTypes = {
  files: PropTypes.arrayOf(PropTypes.object),
  onSetFiles: PropTypes.func.isRequired,
  onRejectedFiles: PropTypes.func,
  onRemoveFile: PropTypes.func,
  isSubmitted: PropTypes.bool,
  maxSizeMessage: PropTypes.string.isRequired,
  maxSize: PropTypes.number.isRequired,
};

FileInputDropZone.defaultProps = {
  files: null,
  isSubmitted: false,
  onRejectedFiles: null,
  onRemoveFile: null,
};

export default FileInputDropZone;
