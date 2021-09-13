import React, { useEffect } from 'react';
import { useFieldArray } from 'react-hook-form';
import { Button } from 'reactstrap';
import { FileInput } from '@tapis/tapis-typescript-apps';
import { DictField, DictFieldArray, FieldSpec, FieldComponentProps } from './DictFieldArray';
import styles from './FileInputs.module.scss';

const FileInputField: React.FC<FieldComponentProps> = ({ refName, item, ...rest }) => {
  const fieldSpecs: Array<FieldSpec> = [
    {
      name: "sourceUrl",
      label: "Source URL",
      required: "Source URL is required",
      description: "Input TAPIS file as a pathname, TAPIS URI or web URL",
      defaultValue: item.sourceUrl
    },
    {
      name: "targetPath",
      label: "Target Path",
      required: "Target is required",
      description: "File mount path inside of running container",
      defaultValue: item.targetPath
    },
    {
      name: "inPlace",
      label: "In Place",
      description: "If this is true, the source URL will be mounted from the execution system's local file system",
      defaultChecked: item.inPlace,
    }
  ];
  return (
    <div className={styles.input} key={item.id}>
      <DictField refName={refName} fieldSpecs={fieldSpecs} {...rest} item={item} />
      <i>Some meta information DictField...</i>
    </div>
  )
}

type FileInputsProps = {
  inputs: Array<FileInput>
  register: any,
  errors: any,
  control: any,
}

const FileInputs: React.FC<FileInputsProps> = ({ inputs, control, ...rest }) => {
  const template: any = {
    sourceUrl: '',
    targetPath: '',
    inPlace: false
  };

  return (
    <DictFieldArray
      refName='jobAttributes.fileInputs'
      title='File Inputs'
      component={FileInputField}
      template={template}
      control={control}
      {...rest}
    />
  )
}

export default FileInputs;

