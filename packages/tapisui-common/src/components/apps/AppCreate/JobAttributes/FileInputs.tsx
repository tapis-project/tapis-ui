import React from 'react';
import { Jobs } from '@tapis/tapis-typescript';
import { Button } from 'reactstrap';
import fieldArrayStyles from './FieldArray.module.scss';
import { Collapse } from '../../../../ui';
import { FieldArray, useFormikContext, FieldArrayRenderProps } from 'formik';
import {
  FormikInput,
  FormikCheck,
  FormikTapisFile,
  FormikSelect,
} from '../../../../ui-formik/FieldWrapperFormik';

import { FileInputModeEnum } from '@tapis/tapis-typescript-apps';

type FileInputFieldProps = {
  item: Jobs.JobFileInput;
  index: number;
  remove: (index: number) => Jobs.JobFileInput | undefined;
};

const JobInputField: React.FC<FileInputFieldProps> = ({
  item,
  index,
  remove,
}) => {
  const { name, sourceUrl } = item;
  const isRequired = false;
  const note = 'User Defined';
  const fileInputModeValues = Object.values(FileInputModeEnum);

  return (
    <>
      <Collapse
        open={!sourceUrl}
        title={name ?? 'File Input'}
        note={note}
        className={fieldArrayStyles.item}
      >
        <FormikInput
          name={`jobAttributes.fileInputs.${index}.name`}
          label="Name"
          required={true}
          description={`${
            isRequired
              ? 'This input is required and cannot be renamed'
              : 'Name of this input'
          }`}
          disabled={isRequired}
        />
        <FormikTapisFile
          name={`jobAttributes.fileInputs.${index}.sourceUrl`}
          label="Source URL"
          required={false}
          description="Input TAPIS file as a pathname, TAPIS URI or web URL"
        />
        <FormikInput
          name={`jobAttributes.fileInputs.${index}.targetPath`}
          label="Target Path"
          required={true}
          description="File mount path inside of running container"
        />
        <FormikInput
          name={`jobAttributes.fileInputs.${index}.description`}
          label="Description"
          required={false}
          description="Description of this input"
        />

        <FormikSelect
          name={`jobAttributes.fileInputs.${index}.inputMode`}
          description="The input mode for the file"
          label="File Input Mode"
          required={false}
          data-testid="file Input Type"
        >
          <option value={''} selected>
            -- select input value type --
          </option>
          {fileInputModeValues.map((values) => {
            return <option>{values}</option>;
          })}
        </FormikSelect>
        <FormikCheck
          name={`jobAttributes.fileInputs.${index}.autoMountLocal`}
          label="Auto-mount Local"
          required={false}
          description="If this is true, the source URL will be mounted from the execution system's local file system"
        />
        {!isRequired && (
          <Button onClick={() => remove(index)} size="sm">
            Remove
          </Button>
        )}
      </Collapse>
    </>
  );
};

const JobInputs: React.FC<{ arrayHelpers: FieldArrayRenderProps }> = ({
  arrayHelpers,
}) => {
  const { values } = useFormikContext();
  let requiredText = '';
  const jobInputs = (values as Partial<Jobs.ReqSubmitJob>)?.fileInputs ?? [];

  return (
    <Collapse
      open={false}
      title="File Inputs"
      note={`${jobInputs.length} items`}
      requiredText={requiredText}
      isCollapsable={true}
      className={fieldArrayStyles.array}
    >
      <div className={fieldArrayStyles.description}>
        These File Inputs will be submitted with your job.
      </div>
      {jobInputs.map((jobInput, index) => (
        <JobInputField
          key={`fileInputs.${index}`}
          item={jobInput}
          index={index}
          remove={arrayHelpers.remove}
        />
      ))}
      <Button onClick={() => arrayHelpers.push({})} size="sm">
        + Add File Input
      </Button>
    </Collapse>
  );
};

export const FileInputs: React.FC = () => {
  return (
    <div>
      <FieldArray
        name="fileInputs"
        render={(arrayHelpers) => {
          return (
            <>
              <JobInputs arrayHelpers={arrayHelpers} />
            </>
          );
        }}
      />
    </div>
  );
};

export default FileInputs;
