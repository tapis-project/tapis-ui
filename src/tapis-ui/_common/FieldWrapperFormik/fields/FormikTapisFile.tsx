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
  allowSystemChange?: boolean;
} & InputProps &
  FieldInputProps<any>;

export const parseTapisURI = (
  uri: string
): { systemId: string; file: Files.FileInfo; parent: string } | undefined => {
  const regex = /tapis:\/\/([\w.\-_]+)\/(.+)/;
  const match = uri?.match(regex);
  if (match) {
    const systemId = match[1];
    const filePath = `/${match[2]}`;
    const parentDir = filePath.split('/').slice(0, -1).join('/');
    return {
      systemId,
      file: {
        name: filePath.split('/').slice(-1)[0],
        path: filePath,
      },
      parent: !!parentDir.length ? parentDir : '/',
    };
  }
  return undefined;
};

export const FormikTapisFileInput: React.FC<FormikTapisFileInputProps> = ({
  append,
  allowSystemChange = true,
  disabled,
  ...props
}) => {
  const { name } = props;
  const [field, , helpers] = useField(name);
  const { setValue } = helpers;
  const { value } = field;
  const { modal, open, close } = useModal();
  const onSelect = useCallback(
    (systemId: string | null, files: Array<Files.FileInfo>) => {
      if (allowSystemChange) {
        setValue(`tapis://${systemId ?? ''}${files[0].path}`);
      } else {
        setValue(`${files[0].path}`)
      }
    },
    [setValue]
  );
  const { systemId, file, parent } = useMemo(
    () =>
      parseTapisURI(value) ?? {
        systemId: undefined,
        file: undefined,
        parent: undefined,
      },
    [value]
  );

  return (
    <>
      <InputGroup>
        <InputGroupAddon addonType="prepend" disabled={disabled}>
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
          path={parent}
          initialSelection={file ? [file] : undefined}
          allowSystemChange
        />
      )}
    </>
  );
};

type FormikTapisFileProps = {
  allowSystemChange?: boolean;
} & FormikInputProps;

const FormikTapisFile: React.FC<FormikTapisFileProps> = ({
  name,
  label,
  required,
  description,
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
