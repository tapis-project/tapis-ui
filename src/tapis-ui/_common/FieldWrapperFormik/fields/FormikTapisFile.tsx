import React, { useCallback, useState } from 'react';
import FieldWrapper from '../FieldWrapperFormik';
import { Input, InputGroup, InputGroupAddon, Button } from 'reactstrap';
import { FieldInputProps, useField } from 'formik';
import { FormikInputProps } from '.';
import { Files } from '@tapis/tapis-typescript'
import { FileSelectModal } from 'tapis-ui/components/files';
import { InputProps } from 'reactstrap';

type FormikTapisFileInputProps = InputProps & FieldInputProps<any>;

export const FormikTapisFileInput: React.FC<FormikTapisFileInputProps> = (props) => {
  const { name } = props;
  const [ , , helpers ] = useField(name);
  const { setValue } = helpers;
  const [modalOpen, setModalOpen] = useState(false);
  const onBrowse = useCallback(() => {
    setModalOpen(true);
  }, [setModalOpen]);
  const toggle = useCallback(() => {
    setModalOpen(false);
  }, [setModalOpen]);
  const onSelect = useCallback(
    (systemId: string | null, files: Array<Files.FileInfo>) => {
      setValue(`tapis://${systemId ?? ''}${files[0].path}`);
    },
    [setValue]
  )

  return (
    <>
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <Button size="sm" onClick={onBrowse}>
            Browse
          </Button>
        </InputGroupAddon>
        <Input {...props} bsSize="sm" />
      </InputGroup>
      {modalOpen && (
        <FileSelectModal
          toggle={toggle} 
          selectMode={{mode: 'single', types: ['dir', 'file']}}
          onSelect={onSelect}
        />
      )}
    </>
  )
}


const FormikTapisFile: React.FC<FormikInputProps> = ({
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
        <FormikTapisFileInput {...props} {...formikProps} bsSize="sm" />
      )}
    />

  );
};

export default React.memo(FormikTapisFile);
