import React from 'react';
import FieldWrapper from '../FieldWrapperFormik';
import { Input, InputGroup, InputGroupAddon, Button } from 'reactstrap';
import { FieldInputProps } from 'formik';
import { FormikInputProps } from '.';
import { GenericModal } from 'tapis-ui/_common';
import { FileExplorer } from 'tapis-ui/components/files';

type FormikBrowseInputProps = {
  onBrowse: () => void;
} & FormikInputProps

const FormikBrowseInput: React.FC<FormikBrowseInputProps> = ({
  name,
  label,
  required,
  description,
  onBrowse,
  ...props
}: FormikInputProps) => {
  return (
    <FieldWrapper
      name={name}
      label={label}
      required={required}
      description={description}
      as={(formikProps: FieldInputProps<any>) => (
        <InputGroup>
          <InputGroupAddon addonType="prepend">
            <Button
              size="sm"
              onClick={onBrowse}
            >
              Browse
            </Button>
          </InputGroupAddon>
          <Input {...props} {...formikProps} bsSize="sm" />
        </InputGroup>
      )}
    />
  );
}

export default React.memo(FormikBrowseInput);
