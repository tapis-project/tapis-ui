import React, { useMemo } from 'react';
import { Apps, Jobs } from '@tapis/tapis-typescript';
import FieldWrapper from '../../../../ui/FieldWrapper';
import { Input } from 'reactstrap';
import { Button } from 'reactstrap';
import { useJobLauncher, StepSummaryField } from '../components';
import styles from './FileInputs.module.scss';
import fieldArrayStyles from '../FieldArray.module.scss';
import {
  generateFileInputFromAppInput,
  getIncompleteJobInputs,
  getAppInputsIncludedByDefault,
} from '../../../../utils/jobFileInputs';
import { Collapse } from '../../../../ui';
import { FieldArray, useFormikContext, FieldArrayRenderProps } from 'formik';
import {
  FormikInput,
  FormikCheck,
  FormikTapisFile,
} from '../../../../ui-formik/FieldWrapperFormik';
import { JobStep } from '..';
import { v4 as uuidv4 } from 'uuid';
import * as Yup from 'yup';

type FileInputFieldProps = {
  item: Jobs.JobFileInput;
  index: number;
  remove: (index: number) => Jobs.JobFileInput | undefined;
};

const upperCaseFirstLetter = (str: string) => {
  const lower = str.toLowerCase();
  return `${lower.slice(0, 1).toUpperCase()}${lower.slice(1)}`;
};

const JobInputField: React.FC<FileInputFieldProps> = ({
  item,
  index,
  remove,
}) => {
  const { app } = useJobLauncher();
  const { name, sourceUrl } = item;
  const inputMode: Apps.FileInputModeEnum | undefined = useMemo(
    () =>
      app.jobAttributes?.fileInputs?.find(
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
    <>
      <Collapse
        open={!sourceUrl}
        title={name ?? 'File Input'}
        note={note}
        className={fieldArrayStyles.item}
      >
        <FormikInput
          name={`fileInputs.${index}.name`}
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
          name={`fileInputs.${index}.sourceUrl`}
          label="Source URL"
          required={true}
          description="Input TAPIS file as a pathname, TAPIS URI or web URL"
        />
        <FormikInput
          name={`fileInputs.${index}.targetPath`}
          label="Target Path"
          required={true}
          description="File mount path inside of running container"
        />
        <FormikInput
          name={`fileInputs.${index}.description`}
          label="Description"
          required={false}
          description="Description of this input"
        />
        <FormikCheck
          name={`fileInputs.${index}.autoMountLocal`}
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

const getFileInputsOfMode = (
  app: Apps.TapisApp,
  inputMode: Apps.FileInputModeEnum
) =>
  app.jobAttributes?.fileInputs?.filter(
    (appInput) => appInput.inputMode === inputMode
  ) ?? [];

const inputIncluded = (
  input: Apps.AppFileInput,
  jobInputs: Array<Jobs.JobFileInput>
) => {
  return jobInputs.some((jobInput) => jobInput.name === input.name);
};

type OptionalInputProps = {
  input: Apps.AppFileInput;
  included: boolean;
  onInclude: () => any;
};

const OptionalInput: React.FC<OptionalInputProps> = ({
  input,
  included,
  onInclude,
}) => {
  return (
    <Collapse
      title={`${input.name} ${included ? '(included)' : ''}`}
      className={styles['optional-input']}
    >
      <div className={fieldArrayStyles.description}>
        {input.description ?? ''}
      </div>
      <FieldWrapper
        label="Source URL"
        required={true}
        description="Input TAPIS file as a pathname, TAPIS URI or web URL"
      >
        <Input bsSize="sm" defaultValue={input.sourceUrl} disabled={true} />
      </FieldWrapper>
      <FieldWrapper
        label="Target Path"
        required={true}
        description="File mount path inside of running container"
      >
        <Input bsSize="sm" defaultValue={input.targetPath} disabled={true} />
      </FieldWrapper>
      <Button onClick={() => onInclude()} disabled={included} size="sm">
        Include
      </Button>
      {included && (
        <div className={fieldArrayStyles.description}>
          This optional input has already been included with your job file
          inputs.
        </div>
      )}
    </Collapse>
  );
};

const OptionalInputs: React.FC<{ arrayHelpers: FieldArrayRenderProps }> = ({
  arrayHelpers,
}) => {
  const { app } = useJobLauncher();
  const { values } = useFormikContext();

  const optionalInputs = useMemo(
    () => getFileInputsOfMode(app, Apps.FileInputModeEnum.Optional),
    /* eslint-disable-next-line */
    [app.id, app.version]
  );

  const formFileInputs =
    (values as Partial<Jobs.ReqSubmitJob>)?.fileInputs ?? [];

  return !!optionalInputs.length ? (
    <Collapse
      title="Optional File Inputs"
      open={true}
      note={`${optionalInputs.length} additional files`}
      className={fieldArrayStyles.array}
    >
      <div className={fieldArrayStyles.description}>
        These File Inputs are defined in the application and can be included
        with your job.
      </div>
      {optionalInputs.map((optionalInput) => {
        const alreadyIncluded = inputIncluded(optionalInput, formFileInputs);
        const onInclude = () => {
          arrayHelpers.push(generateFileInputFromAppInput(optionalInput));
        };
        return (
          <div
            className={fieldArrayStyles.item}
            key={`optional-input-${optionalInput.name}`}
          >
            <OptionalInput
              input={optionalInput}
              onInclude={onInclude}
              included={alreadyIncluded}
            />
          </div>
        );
      })}
    </Collapse>
  ) : null;
};

const FixedInput: React.FC<{ input: Apps.AppFileInput }> = ({ input }) => {
  return (
    <Collapse title={`${input.name}`} className={styles['optional-input']}>
      <div className={fieldArrayStyles.description}>
        {input.description ?? ''}
      </div>
      <FieldWrapper
        label="Source URL"
        required={true}
        description="Input TAPIS file as a pathname, TAPIS URI or web URL"
      >
        <Input bsSize="sm" defaultValue={input.sourceUrl} disabled={true} />
      </FieldWrapper>
      <FieldWrapper
        label="Target Path"
        required={true}
        description="File mount path inside of running container"
      >
        <Input bsSize="sm" defaultValue={input.targetPath} disabled={true} />
      </FieldWrapper>
    </Collapse>
  );
};

const FixedInputs: React.FC = () => {
  const { app } = useJobLauncher();

  const fixedInputs = useMemo(
    () => getFileInputsOfMode(app, Apps.FileInputModeEnum.Fixed),
    /* eslint-disable-next-line */
    [app.id, app.version]
  );

  return (
    <Collapse
      title="Fixed File Inputs"
      open={true}
      note={`${fixedInputs.length} additional files`}
      className={fieldArrayStyles.array}
    >
      <div className={fieldArrayStyles.description}>
        These File Inputs are defined in the application and will automatically
        be included with your job. They cannot be removed or altered.
      </div>
      {fixedInputs.map((fixedInput) => (
        <div
          className={fieldArrayStyles.item}
          key={`fixed-input-${fixedInput.name}`}
        >
          <FixedInput input={fixedInput} />
        </div>
      ))}
    </Collapse>
  );
};

const JobInputs: React.FC<{ arrayHelpers: FieldArrayRenderProps }> = ({
  arrayHelpers,
}) => {
  const { values } = useFormikContext();
  const { app } = useJobLauncher();
  const requiredInputs = useMemo(
    () => getFileInputsOfMode(app, Apps.FileInputModeEnum.Required),
    /* eslint-disable-next-line */
    [app.id, app.version]
  );
  let requiredText =
    requiredInputs.length > 0 ? `Required (${requiredInputs.length})` : '';
  const jobInputs = (values as Partial<Jobs.ReqSubmitJob>)?.fileInputs ?? [];

  return (
    <Collapse
      open={requiredInputs.length > 0}
      title="File Inputs"
      note={`${jobInputs.length} items`}
      requiredText={requiredText}
      isCollapsable={requiredInputs.length === 0}
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
      <h2>File Inputs</h2>
      <FieldArray
        name="fileInputs"
        render={(arrayHelpers) => {
          return (
            <>
              <JobInputs arrayHelpers={arrayHelpers} />
              <OptionalInputs arrayHelpers={arrayHelpers} />
              <FixedInputs />
            </>
          );
        }}
      />
    </div>
  );
};

export const FileInputsSummary: React.FC = () => {
  const { job, app } = useJobLauncher();
  const jobFileInputs = job.fileInputs ?? [];
  const appFileInputs = app.jobAttributes?.fileInputs ?? [];
  const missingRequiredInputs = appFileInputs.filter(
    (appFileInput) =>
      appFileInput.inputMode === Apps.FileInputModeEnum.Required &&
      !jobFileInputs.some(
        (jobFileInput) => jobFileInput.name === appFileInput.name
      )
  );
  const incompleteJobInputs = getIncompleteJobInputs(
    appFileInputs,
    jobFileInputs
  );
  const includedByDefault = getAppInputsIncludedByDefault(
    appFileInputs,
    jobFileInputs
  );
  return (
    <div key="file-inputs-summary">
      {jobFileInputs.map((jobFileInput) => {
        const complete = !incompleteJobInputs.some(
          (incompleteInput) => incompleteInput.name === jobFileInput.name
        );
        // If this job file input is complete, display its name or sourceUrl
        const field = complete
          ? `${jobFileInput.name}: ${jobFileInput.sourceUrl}` ??
            jobFileInput.sourceUrl
          : undefined;
        const key =
          jobFileInput.name ??
          jobFileInput.sourceUrl ??
          jobFileInput.targetPath;
        // If this job file input is incomplete, display its name or sourceUrl
        const error = !complete
          ? `${key ?? 'A file input'} is missing required information`
          : undefined;
        return (
          <StepSummaryField
            field={field}
            error={error}
            key={`file-inputs-summary-${key ?? uuidv4()}`}
          />
        );
      })}
      {missingRequiredInputs.map((requiredFileInput) => (
        <StepSummaryField
          error={`${requiredFileInput.name} is required`}
          key={`file-inputs-required-error-${requiredFileInput.name}`}
        />
      ))}
      {includedByDefault.map((defaultInput) => (
        <StepSummaryField
          field={`${defaultInput.name} included by default`}
          key={`file-inputs-default-${defaultInput.name}`}
        />
      ))}
    </div>
  );
};

const validationSchema = Yup.object().shape({
  fileInputs: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().min(1).required('A fileInput name is required'),
      sourceUrl: Yup.string().min(1).required('A sourceUrl is required'),
      targetPath: Yup.string().min(1).required('A targetPath is required'),
      autoMountLocal: Yup.boolean(),
    })
  ),
});

const step: JobStep = {
  id: 'fileInputs',
  name: 'File Inputs',
  render: <FileInputs />,
  summary: <FileInputsSummary />,
  validationSchema,
  generateInitialValues: ({ job }) => ({
    fileInputs: job.fileInputs,
  }),
};

export default step;
