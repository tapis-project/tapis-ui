import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FileInput } from '@tapis/tapis-typescript-apps';
import { FieldArray, FieldArrayComponent } from './FieldArray';
import FieldWrapper from 'tapis-ui/_common/FieldWrapper';
import { Button, Input, Label, FormText, FormGroup } from 'reactstrap';
import { mapInnerRef } from 'tapis-ui/utils/forms';
import styles from './FileInputs.module.scss';

const FileInputField: FieldArrayComponent = ({ refName, item, remove }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const { sourceUrl, targetPath, inPlace, id } = item;

  return (
    <div className={styles.input} key={id}>
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
            className={styles['form-input-override']}
          />{' '}
          In Place
        </Label>
        <FormText className="form-field__help" color="muted">
          If this is true, the source URL will be mounted from the execution
          system's local file system
        </FormText>
      </FormGroup>
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

const FileInputs: React.FC = () => {
  const refName = 'jobAttributes.fileInputs';

  const template: FileInput = {
    sourceUrl: '',
    targetPath: '',
    inPlace: false,
    meta: {
      name: '',
      description: '',
      required: false,
    },
  };

  return (
    <FieldArray
      title="File Inputs"
      template={template}
      addButtonText="Add File Input"
      refName={refName}
      component={FileInputField}
    />
  );
};

export default FileInputs;
