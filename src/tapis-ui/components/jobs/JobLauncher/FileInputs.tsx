import React from 'react';
import { FileInput } from '@tapis/tapis-typescript-apps';
import {
  DictField,
  DictFieldArray,
  FieldSpec,
  FieldArrayComponentProps,
} from './DictFieldArray';
import { Button } from 'reactstrap';
import styles from './FileInputs.module.scss';

const FileInputField: React.FC<FieldArrayComponentProps> = ({
  refName,
  item,
  remove,
  ...rest
}) => {
  const { sourceUrl, targetPath, inPlace, id } = item;
  const fieldSpecs: Array<FieldSpec> = [
    {
      name: 'sourceUrl',
      label: 'Source URL',
      required: 'Source URL is required',
      description: 'Input TAPIS file as a pathname, TAPIS URI or web URL',
      defaultValue: sourceUrl,
    },
    {
      name: 'targetPath',
      label: 'Target Path',
      required: 'Target is required',
      description: 'File mount path inside of running container',
      defaultValue: targetPath,
    },
    {
      name: 'inPlace',
      label: 'In Place',
      description:
        "If this is true, the source URL will be mounted from the execution system's local file system",
      defaultChecked: inPlace,
    },
  ];
  return (
    <div className={styles.input} key={id}>
      <DictField
        refName={refName}
        fieldSpecs={fieldSpecs}
        {...rest}
        item={item}
      />
      {/* Possible metadata implementation
        <DictField refName={`${refName}.meta`} fieldSpecs={metaSpecs} {...rest} item={item.meta} />
      */}
      {!item?.meta?.required && (
        <Button onClick={remove} size="sm">
          Remove
        </Button>
      )}
    </div>
  );
};

type FileInputsProps = {
  inputs: Array<FileInput>;
  register: any;
  errors: any;
  control: any;
};

const FileInputs: React.FC<FileInputsProps> = ({
  inputs,
  control,
  ...rest
}) => {
  const refName = 'jobAttributes.fileInputs';

  const template: any = {
    sourceUrl: '',
    targetPath: '',
    inPlace: false,
    meta: {},
  };

  return (
    <DictFieldArray
      title="File Inputs"
      template={template}
      addButtonText="Add File Input"
      refName={refName}
      component={FileInputField}
      control={control}
      {...rest}
    />
  );
};

export default FileInputs;
