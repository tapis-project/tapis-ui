import React, { useMemo } from 'react';
import { Apps, Jobs } from '@tapis/tapis-typescript';
import FieldWrapper from 'tapis-ui/_common/FieldWrapper';
import { Input } from 'reactstrap';
import { Button } from 'reactstrap';
import { useJobLauncher, StepSummaryField } from '../components';
import styles from './FileInputs.module.scss';
import fieldArrayStyles from '../FieldArray.module.scss';
import {
  generateFileInputArrayFromAppInput,
  getIncompleteJobInputArrays,
  getAppInputArraysIncludedByDefault,
} from 'tapis-api/utils/jobFileInputArrays';
import { Collapse } from 'tapis-ui/_common';
import { FieldArray, useFormikContext, FieldArrayRenderProps } from 'formik';
import { FormikJobStepWrapper } from '../components';
import { FormikInput, FormikCheck } from 'tapis-ui/_common/FieldWrapperFormik';
import { v4 as uuidv4 } from 'uuid';
import * as Yup from 'yup';

type JobInputArrayFieldProps = {
  item: Jobs.JobFileInputArray;
  index: number;
  remove: (index: number) => Jobs.JobFileInput | undefined;
};

const upperCaseFirstLetter = (str: string) => {
  const lower = str.toLowerCase();
  return `${lower.slice(0, 1).toUpperCase()}${lower.slice(1)}`;
};

const JobInputArrayField: React.FC<JobInputArrayFieldProps> = ({
  item,
  index,
  remove,
}) => {
  const { app } = useJobLauncher();
  const { name, sourceUrls } = item;
  const inputMode: Apps.FileInputModeEnum | undefined = useMemo(
    () =>
      app.jobAttributes?.fileInputArrays?.find(
        (appInput) => appInput.name === item.name
      )?.inputMode ?? undefined,
    /* eslint-disable-next-line */
    [app.id, app.version]
  );
  const isRequired = inputMode === Apps.FileInputModeEnum.Required;
  const note = `${
    inputMode ? upperCaseFirstLetter(inputMode) : 'User Defined'
  }`;
  return (
    <Collapse
      open={!sourceUrls}
      key={`fileInputArrays.${index}`}
      title={name ?? 'File Input Array'}
      note={note}
      className={styles['job-input']}
    >
      <FormikInput
        name={`fileInputArrays.${index}.name`}
        label="Name"
        required={true}
        description={`${
          isRequired
            ? 'This input is required and cannot be renamed'
            : 'Name of this input'
        }`}
        disabled={isRequired}
      />
      {/*
      <FormikInput
        name={`fileInputs.${index}.sourceUrl`}
        label="Source URL"
        required={true}
        description="Input TAPIS file as a pathname, TAPIS URI or web URL"
      />
      */}
      <FormikInput
        name={`fileInputArrays.${index}.targetDir`}
        label="Target Directory"
        required={true}
        description="File mount path inside of running container"
      />
      <FormikInput
        name={`fileInputArrays.${index}.description`}
        label="Description"
        required={false}
        description="Description of this input"
      />
      {!isRequired && (
        <Button onClick={() => remove(index)} size="sm">
          Remove
        </Button>
      )}
    </Collapse>
  );
};

const getFileInputArraysOfMode = (
  app: Apps.TapisApp,
  inputMode: Apps.FileInputModeEnum
) =>
  app.jobAttributes?.fileInputArrays?.filter(
    (appInputArray) => appInputArray.inputMode === inputMode
  ) ?? [];

const inputArrayIncluded = (
  input: Apps.AppFileInputArray,
  jobInputArrays: Array<Jobs.JobFileInputArray>
) => {
  return jobInputArrays.some((jobInputArray) => jobInputArray.name === input.name);
};

type OptionalInputArrayProps = {
  inputArray: Apps.AppFileInputArray;
  included: boolean;
  onInclude: () => any;
};

const OptionalInputArray: React.FC<OptionalInputArrayProps> = ({
  inputArray,
  included,
  onInclude,
}) => {
  return (
    <Collapse
      title={`${inputArray.name} ${included ? '(included)' : ''}`}
      key={`optional-input-array-${inputArray.name}`}
      className={styles['optional-input']}
    >
      <div className={styles.description}>{inputArray.description ?? ''}</div>
      {/*
      <FieldWrapper
        label="Source URL"
        required={true}
        description="Input TAPIS file as a pathname, TAPIS URI or web URL"
      >
        <Input bsSize="sm" defaultValue={inputArray.sourceUrl} disabled={true} />
      </FieldWrapper>
      */}
      <FieldWrapper
        label="Target Path"
        required={true}
        description="File mount path inside of running container"
      >
        <Input bsSize="sm" defaultValue={inputArray.targetDir} disabled={true} />
      </FieldWrapper>
      <Button onClick={() => onInclude()} disabled={included} size="sm">
        Include
      </Button>
      {included && (
        <div className={styles.description}>
          This optional input array has already been included with your job file
          inputs.
        </div>
      )}
    </Collapse>
  );
};

const OptionalInputArrays: React.FC<{ arrayHelpers: FieldArrayRenderProps }> = ({
  arrayHelpers,
}) => {
  const { app } = useJobLauncher();
  const { values } = useFormikContext();

  const optionalInputArrays = useMemo(
    () => getFileInputArraysOfMode(app, Apps.FileInputModeEnum.Optional),
    /* eslint-disable-next-line */
    [app.id, app.version]
  );

  const formFileInputArrays =
    (values as Partial<Jobs.ReqSubmitJob>)?.fileInputArrays ?? [];

  return !!optionalInputArrays.length ? (
    <Collapse
      title="Optional File Input Arrays"
      open={true}
      note={`${optionalInputArrays.length} additional files`}
      className={fieldArrayStyles.array}
    >
      <div className={styles.description}>
        These File Inputs are defined in the application and can be included
        with your job.
      </div>
      {optionalInputArrays.map((optionalInputArray) => {
        const alreadyIncluded = inputArrayIncluded(optionalInputArray, formFileInputArrays);
        const onInclude = () => {
          arrayHelpers.push(generateFileInputArrayFromAppInput(optionalInputArray));
        };
        return (
          <div className={fieldArrayStyles.item}>
            <OptionalInputArray
              inputArray={optionalInputArray}
              onInclude={onInclude}
              included={alreadyIncluded}
            />
          </div>
        );
      })}
    </Collapse>
  ) : null;
};

const FixedInputArray: React.FC<{ inputArray: Apps.AppFileInputArray }> = ({ inputArray }) => {
  return (
    <Collapse
      title={`${inputArray.name}`}
      key={`fixed-input-${inputArray.name}`}
      className={styles['optional-input']}
    >
      <div className={styles.description}>{inputArray.description ?? ''}</div>
      {/*
      <FieldWrapper
        label="Source URL"
        required={true}
        description="Input TAPIS file as a pathname, TAPIS URI or web URL"
      >
        <Input bsSize="sm" defaultValue={inputArray.sourceUrl} disabled={true} />
      </FieldWrapper>
      <FieldWrapper
        label="Target Path"
        required={true}
        description="File mount path inside of running container"
      >
        <Input bsSize="sm" defaultValue={inputArray.targetPath} disabled={true} />
      </FieldWrapper>
      */}
    </Collapse>
  );
};

const FixedInputArrays: React.FC = () => {
  const { app } = useJobLauncher();

  const fixedInputArrays = useMemo(
    () => getFileInputArraysOfMode(app, Apps.FileInputModeEnum.Fixed),
    /* eslint-disable-next-line */
    [app.id, app.version]
  );

  return (
    <Collapse
      title="Fixed File Input Arrays"
      open={true}
      note={`${fixedInputArrays.length} additional files`}
      className={fieldArrayStyles.array}
    >
      <div className={styles.description}>
        These File Inputs are defined in the application and will automatically
        be included with your job. They cannot be removed or altered.
      </div>
      {fixedInputArrays.map((fixedInputArray) => (
        <div className={fieldArrayStyles.item}>
          <FixedInputArray inputArray={fixedInputArray} />
        </div>
      ))}
    </Collapse>
  );
};

const JobInputArrays: React.FC<{ arrayHelpers: FieldArrayRenderProps }> = ({
  arrayHelpers,
}) => {
  const { values } = useFormikContext();
  const { app } = useJobLauncher();
  const requiredInputArrays = useMemo(
    () => getFileInputArraysOfMode(app, Apps.FileInputModeEnum.Required),
    /* eslint-disable-next-line */
    [app.id, app.version]
  );
  let requiredText =
    requiredInputArrays.length > 0 ? `Required (${requiredInputArrays.length})` : '';
  const jobInputArrays = (values as Partial<Jobs.ReqSubmitJob>)?.fileInputArrays ?? [];

  return (
    <Collapse
      open={requiredInputArrays.length > 0}
      title="File Inputs Arrays"
      note={`${jobInputArrays.length} items`}
      requiredText={requiredText}
      isCollapsable={requiredInputArrays.length === 0}
      className={fieldArrayStyles.array}
    >
      <div className={styles.description}>
        These File Input Arrays will be submitted with your job.
      </div>
      {jobInputArrays.map((jobInputArray, index) => (
        <JobInputArrayField
          item={jobInputArray}
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

export const FileInputArrays: React.FC = () => {
  const { job } = useJobLauncher();

  const validationSchema = Yup.object().shape({
    fileInputs: Yup.array().of(
      Yup.object().shape({
        name: Yup.string().min(1).required('A fileInput name is required'),
        sourceUrl: Yup.string().min(1).required('A sourceUrl is required'),
        targetPath: Yup.string().min(1).required('A targetPath is required'),
      })
    ),
  });

  const initialValues = useMemo(
    () => ({
      fileInputArrays: job.fileInputArrays,
    }),
    [job]
  );

  return (
    <FormikJobStepWrapper
      validationSchema={validationSchema}
      initialValues={initialValues}
    >
      <FieldArray
        name="fileInputs"
        render={(arrayHelpers) => {
          return (
            <>
              <JobInputArrays arrayHelpers={arrayHelpers} />
              <OptionalInputArrays arrayHelpers={arrayHelpers} />
              <FixedInputArrays />
            </>
          );
        }}
      />
    </FormikJobStepWrapper>
  );
};

export const FileInputArraysSummary: React.FC = () => {
  const { job, app } = useJobLauncher();
  const jobFileInputArrays = job.fileInputArrays ?? [];
  const appFileInputArrays = app.jobAttributes?.fileInputArrays ?? [];
  const missingRequiredInputArrays = appFileInputArrays.filter(
    (appFileInputArray) =>
      appFileInputArray.inputMode === Apps.FileInputModeEnum.Required &&
      !jobFileInputArrays.some(
        (jobFileInputArray) => jobFileInputArray.name === appFileInputArray.name
      )
  );
  const incompleteJobInputs = getIncompleteJobInputArrays(
    appFileInputArrays,
    jobFileInputArrays
  );
  const includedByDefault = getAppInputArraysIncludedByDefault(
    appFileInputArrays,
    jobFileInputArrays
  );
  return (
    <div>
      {jobFileInputArrays.map((jobFileInputArray) => {
        const complete = !incompleteJobInputs.some(
          (incompleteInput) => incompleteInput.name === jobFileInputArray.name
        );
        // If this job file input is complete, display its name or sourceUrl
        const field = complete
          ? jobFileInputArray.name ?? 
            (jobFileInputArray.sourceUrls ? `${jobFileInputArray.sourceUrls[0]}...` : undefined)
          : undefined;
        const key =
          jobFileInputArray.name ??
          (jobFileInputArray.sourceUrls ? `${jobFileInputArray.sourceUrls[0]}...` : undefined) ??
          jobFileInputArray.targetDir;
        // If this job file input is incomplete, display its name or sourceUrl
        const error = !complete
          ? `${key ?? 'A file input array'} is missing required information`
          : undefined;
        return (
          <StepSummaryField
            field={field}
            error={error}
            key={`file-input-arrays-summary-${key ?? uuidv4()}`}
          />
        );
      })}
      {missingRequiredInputArrays.map((requiredFileInput) => (
        <StepSummaryField
          error={`${requiredFileInput.name} is required`}
          key={`file-inputs-arrays-required-error-${requiredFileInput.name}`}
        />
      ))}
      {includedByDefault.map((defaultInput) => (
        <StepSummaryField
          field={`${defaultInput.name} included by default`}
          key={`file-input-arrays-default-${defaultInput.name}`}
        />
      ))}
    </div>
  );
};
