import React from 'react';
import { FormGroup, FormText, Label } from 'reactstrap';
import PropTypes from 'prop-types';
import FileInputDropZone from './FileInputDropZone';
import './FormField.scss';

function FileInputDropZoneFormField({
  id,
  isSubmitted,
  description,
  maxSizeMessage,
  maxSize,
}) {
  const [field, , helpers] = useField(id);

  const onSetFiles = (acceptedFiles) => {
    helpers.setValue([...field.value, ...acceptedFiles]);
  };
  const onRemoveFile = (fileIndex) => {
    const files = field.value;
    files.splice(fileIndex, 1);
    helpers.setValue(files);
  };
  return (
    <FormGroup>
      <Label
        for={id}
        size="sm"
        className="form-field__label"
        style={{ display: 'flex', alignItems: 'center' }}
      >
        Attach Files
      </Label>
      <FileInputDropZone
        id={id}
        files={field.value}
        onSetFiles={onSetFiles}
        onRemoveFile={onRemoveFile}
        isSubmitted={isSubmitted}
        maxSizeMessage={maxSizeMessage}
        maxSize={maxSize}
      />
      <FormText className="form-field__help" color="muted">
        {description}
      </FormText>
    </FormGroup>
  );
}

FileInputDropZoneFormField.propTypes = {
  id: PropTypes.string.isRequired,
  isSubmitted: PropTypes.bool.isRequired,
  description: PropTypes.string,
  maxSizeMessage: PropTypes.string.isRequired,
  maxSize: PropTypes.number,
};

FileInputDropZoneFormField.defaultProps = {
  description: undefined,
  maxSize: Infinity,
};

export default FileInputDropZoneFormField;
