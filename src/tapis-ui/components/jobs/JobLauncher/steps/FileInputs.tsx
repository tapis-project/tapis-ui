import React from 'react';
import { useFormContext, FieldArray as TFieldArray } from 'react-hook-form';
import { Apps, Jobs } from '@tapis/tapis-typescript';
import { FieldArray, FieldArrayComponent } from '../FieldArray';
import FieldWrapper from 'tapis-ui/_common/FieldWrapper';
import { Input, FormText, FormGroup } from 'reactstrap';
import { mapInnerRef } from 'tapis-ui/utils/forms';
import { Button } from 'reactstrap';
import styles from './FileInputs.module.scss';

const FileInputField: FieldArrayComponent<Jobs.ReqSubmitJob, 'fileInputs'> = ({
  item,
  index,
  remove,
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<Jobs.ReqSubmitJob>();
  const { sourceUrl, targetPath, id } = item;
  const itemError = errors?.fileInputs && errors.fileInputs[index];

  return (
    <div key={id}>
      <FieldWrapper
        label="Source URL"
        required={true}
        description="Input TAPIS file as a pathname, TAPIS URI or web URL"
        error={itemError?.sourceUrl}
      >
        <Input
          bsSize="sm"
          defaultValue={sourceUrl}
          {...mapInnerRef(
            register(`fileInputs.${index}.sourceUrl`, {
              required: 'Source URL is required',
            })
          )}
        />
      </FieldWrapper>
      <FieldWrapper
        label="Target Path"
        required={true}
        description="File mount path inside of running container"
        error={itemError?.targetPath}
      >
        <Input
          bsSize="sm"
          defaultValue={targetPath}
          {...mapInnerRef(
            register(`fileInputs.${index}.targetPath`, {
              required: 'Target Path is required',
            })
          )}
        />
      </FieldWrapper>
      <FormGroup check>
        {/*
          <Label check className="form-field__label" size="sm">
            <Input
              type="checkbox"
              bsSize="sm"
              defaultChecked={inPlace}
              {...mapInnerRef(register(`fileInputs.${index}.inPlace`))}
            />{' '}
            In Place
          </Label>
        */}

        <FormText className="form-field__help" color="muted">
          If this is true, the source URL will be mounted from the execution
          system's local file system
        </FormText>
      </FormGroup>
      {remove && (
        <Button onClick={() => remove()} size="sm" className={styles.remove}>
          Remove
        </Button>
      )}
    </div>
  );
};

export const FileInputs: React.FC<{ app?: Apps.TapisApp }> = ({ app }) => {
  const appInputs = app?.jobAttributes?.fileInputs ?? [];
  const required = Array.from(
    appInputs
      .filter(
        (fileInput) => fileInput?.inputMode === Apps.FileInputModeEnum.Required
      )
      .keys()
  );

  const appendData: TFieldArray<Required<Jobs.ReqSubmitJob>, 'fileInputs'> = {
    sourceUrl: '',
    targetPath: '',
  };

  const name = 'fileInputs';

  return (
    <FieldArray<Jobs.ReqSubmitJob, typeof name>
      title="File Inputs"
      addButtonText="Add File Input"
      name={name}
      render={FileInputField}
      required={required}
      appendData={appendData}
    />
  );
};

export const FileInputsSummary: React.FC = () => {
  return <div>Files</div>;
};
