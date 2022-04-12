import React, { useCallback, useMemo } from 'react';
import FieldWrapper from '../FieldWrapperFormik';
import { Input, InputGroup, InputGroupAddon, Button } from 'reactstrap';
import { FieldInputProps, useField } from 'formik';
import { FormikInputProps } from '.';
import { Files, Jobs } from '@tapis/tapis-typescript';
import { FileSelectModal } from 'tapis-ui/components/files';
import { InputProps } from 'reactstrap';
import { useModal } from 'tapis-ui/_common/GenericModal';

const pathToFile = (path?: string): Files.FileInfo | undefined => {
  if (path) {
    return {
      name: path.split('/').slice(-1)[0],
      path
    }
  }
  return undefined;
}

const pathParent = (path?: string): string => {
  const parentDir = path?.split('/').slice(0, -1).join('/'); 
  return !!parentDir && !!parentDir.length ? parentDir : '/';
}

export const parseTapisURI = (
  uri?: string
): { systemId: string; file: Files.FileInfo; parent: string } | undefined => {
  const regex = /tapis:\/\/([\w.\-_]+)\/(.+)/;
  const match = uri?.match(regex);
  if (match) {
    const systemId = match[1];
    const filePath = `/${match[2]}`;
    return {
      systemId,
      file: pathToFile(filePath)!,
      parent: pathParent(filePath),
    };
  }
  return undefined;
};

type FormikTapisFileInputProps = {
  append?: React.ReactNode;
  allowSystemChange?: boolean;
  systemId?: string;
  path?: string;
} & InputProps &
  FieldInputProps<any>;

export const FormikTapisFileInput: React.FC<FormikTapisFileInputProps> = ({
  append,
  allowSystemChange = true,
  disabled,
  systemId,
  path,
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
  const { systemId: parsedSystemId, file, parent } = useMemo(
    () => {
      const result =  parseTapisURI(value) ?? {
        systemId: systemId,
        file: value ? pathToFile(value) : pathToFile(path),
        parent: value ? pathParent(value) : pathParent(path),
      }
      return result;
    },
    [value, systemId, path]
  );

  return (
    <>
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <Button size="sm" onClick={open} disabled={disabled}>
            Browse
          </Button>
        </InputGroupAddon>
        <Input disabled={disabled} {...props} bsSize="sm" />
        {!!append && (
          <InputGroupAddon addonType="append">{append}</InputGroupAddon>
        )}
      </InputGroup>
      {modal && (
        <FileSelectModal
          toggle={close}
          selectMode={{ mode: 'single', types: ['file', 'dir'] }}
          onSelect={onSelect}
          systemId={parsedSystemId ?? systemId}
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
  systemId?: string,
  path?: string,
} & FormikInputProps;

const FormikTapisFile: React.FC<FormikTapisFileProps> = ({
  name,
  label,
  required,
  description,
  systemId,
  path,
  ...props
}: FormikInputProps) => {
  return (
    <FieldWrapper
      name={name}
      label={label}
      required={required}
      description={description}
      as={(formikProps: FieldInputProps<any>) => (
        <FormikTapisFileInput {...props} {...formikProps} bsSize="sm" systemId={systemId} path={path} />
      )}
    />
  );
};

export default React.memo(FormikTapisFile);
