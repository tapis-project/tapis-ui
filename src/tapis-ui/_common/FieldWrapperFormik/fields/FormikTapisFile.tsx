import React, { useCallback, useMemo } from 'react';
import FieldWrapper from '../FieldWrapperFormik';
import { Input, InputGroup, InputGroupAddon, Button } from 'reactstrap';
import { FieldInputProps, useField } from 'formik';
import { FormikInputProps } from '.';
import { Files } from '@tapis/tapis-typescript';
import { FileSelectModal } from 'tapis-ui/components/files';
import { InputProps } from 'reactstrap';
import { useModal } from 'tapis-ui/_common/GenericModal';

type FormikTapisFileInputProps = {
  append?: React.ReactNode;
} & InputProps &
  FieldInputProps<any>;


const parseTapisURI = (uri: string): { systemId: string, file: Files.FileInfo, path: string } | undefined => {
  const regex = /tapis:\/\/([\w\.\-_]+)\/(.+)/;
  const match = uri.match(regex);
  if (match) {
    const systemId = match[1];
    const filePath = `/${match[2]}`;
    return {
      systemId,
      file: {
        name: filePath.split('/').slice(-1)[0],
        path: filePath
      },
      path: filePath.split('/').slice(0, -1).join('/')
    }
  } 
  return undefined;
}

export const FormikTapisFileInput: React.FC<FormikTapisFileInputProps> = ({
  append,
  ...props
}) => {
  const { name } = props;
  const [field, meta, helpers] = useField(name);
  const { setValue } = helpers;
  const { value } = field;
  const { modal, open, close } = useModal(); 
  const onSelect = useCallback(
    (systemId: string | null, files: Array<Files.FileInfo>) => {
      setValue(`tapis://${systemId ?? ''}${files[0].path}`);
    },
    [setValue]
  );
  const { systemId, file, path } = useMemo(() => parseTapisURI(value) ?? { systemId: undefined, file: undefined, path: undefined }, [ value ])

  return (
    <>
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <Button size="sm" onClick={open}>
            Browse
          </Button>
        </InputGroupAddon>
        <Input {...props} bsSize="sm" />
        {!!append && (
          <InputGroupAddon addonType="append">{append}</InputGroupAddon>
        )}
      </InputGroup>
      {modal && (
        <FileSelectModal
          toggle={close}
          selectMode={{ mode: 'single', types: ['file', 'dir'] }}
          onSelect={onSelect}
          systemId={systemId}
          path={path}
          initialSelection={ file ? [ file ] : undefined}
        />
      )}
    </>
  );
};

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
