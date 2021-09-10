import React, { useEffect } from 'react';
import { UseFormRegister, FieldValues, FieldError, DeepMap, Control, useFieldArray } from 'react-hook-form';
import DictField, { Spec } from './DictField';
import { Button } from 'reactstrap';
import { FileInput } from '@tapis/tapis-typescript-apps';


type FileInputFieldProps = {
  refName: string,
  item: any,
  register: any,
  errors: any,
  control: any
}

const FileInputField: React.FC<FileInputFieldProps> = ({ refName, item, ...rest }) => {
  const specs: Array<Spec> = [
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
      checked: item.inPlace,
      type: "checkbox"
    }
  ];
  return (
    <div>
      <DictField refName={refName} specs={specs} {...rest} />
      <i>Some meta information DictField...</i>
    </div>
  )
}

type FileInputsProps = {
  inputs: Array<FileInput>
  register: any,
  errors: any,
  control: any,
  reset?: any
}

const FileInputs: React.FC<FileInputsProps> = ({ inputs, reset, control, ...rest }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fileInputs'
  });

  const dictTemplate: any = {
    sourceUrl: '',
    targetPath: '',
    inPlace: false
  };

  useEffect(
    () => {
      console.log("Resetting");
      if (reset) {
        reset()
      }
    }, [ reset ]
  )

  return <div>
    {fields.map((item, index) => <FileInputField key={item.id} item={item} refName={`jobAttributes.fileInputs.${index}`} control={control} {...rest} />)}
    <Button onClick={() => append(dictTemplate)}>+</Button>
  </div>
}

export default FileInputs;

