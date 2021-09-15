import React from 'react';
import { useFormContext, FieldArrayPath } from 'react-hook-form';
import { FileInput } from '@tapis/tapis-typescript-apps';
import { FieldArray, FieldArrayComponent } from './FieldArray';
import FieldWrapper from 'tapis-ui/_common/FieldWrapper';
import { Input, Label, FormText, FormGroup } from 'reactstrap';
import { mapInnerRef } from 'tapis-ui/utils/forms';
import { Jobs } from '@tapis/tapis-typescript';

const FileInputField: FieldArrayComponent<Jobs.ReqSubmitJob> = ({
  refName,
  item,
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const { sourceUrl, targetPath, inPlace, id } = item;

  return (
    <div key={id}>
      <FieldWrapper
        label="Source URL"
        required={true}
        description="Input TAPIS file as a pathname, TAPIS URI or web URL"
        error={errors['sourceUrl']}
      >
        <Input
          bsSize="sm"
          defaultValue={sourceUrl}
          {...mapInnerRef(
            register(`${refName}.sourceUrl`, {
              required: 'Source URL is required',
            })
          )}
        />
      </FieldWrapper>
      <FieldWrapper
        label="Target Path"
        required={true}
        description="File mount path inside of running container"
        error={errors['targetPath']}
      >
        <Input
          bsSize="sm"
          defaultValue={targetPath}
          {...mapInnerRef(
            register(`${refName}.targetPath`, {
              required: 'Target Path is required',
            })
          )}
        />
      </FieldWrapper>
      <FormGroup check>
        <Label check className="form-field__label" size="sm">
          <Input
            type="checkbox"
            bsSize="sm"
            defaultChecked={inPlace}
            {...mapInnerRef(register(`${refName}.inPlace`))}
          />{' '}
          In Place
        </Label>
        <FormText className="form-field__help" color="muted">
          If this is true, the source URL will be mounted from the execution
          system's local file system
        </FormText>
      </FormGroup>
    </div>
  );
};

type FileInputsProps = {
  inputs: Array<FileInput>;
};

const FileInputs: React.FC<FileInputsProps> = ({ inputs }) => {
  const refName: FieldArrayPath<Jobs.ReqSubmitJob> = 'fileInputs';
  const required = Array.from(
    inputs.filter((fileInput) => fileInput?.meta?.required).keys()
  );

  const appendData: FileInput = {
    sourceUrl: '',
    targetPath: '',
    inPlace: false,
    meta: {
      name: '',
      description: '',
      required: false,
    },
  };

  return FieldArray<Jobs.ReqSubmitJob>({
    title: 'File Inputs',
    addButtonText: 'Add File Input',
    appendData,
    refName,
    render: FileInputField,
    required,
  });
};

export default FileInputs;
