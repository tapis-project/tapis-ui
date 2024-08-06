import React, { useMemo, useCallback } from 'react';
import { Apps, Files, Jobs } from '@tapis/tapis-typescript';
import { Input, Button, FormGroup } from 'reactstrap';
import { useJobLauncher, StepSummaryField } from '../components';
import {
  generateFileInputArrayFromAppInput,
  getIncompleteJobInputArrays,
  getAppInputArraysIncludedByDefault,
} from '../../../../utils/jobFileInputArrays';
import { Collapse, Icon, FieldWrapper } from '../../../../ui';
import { useModal } from '../../../../ui';
import { FileSelectModal } from '../../../../components/files';
import {
  FieldArray,
  useFormikContext,
  FieldArrayRenderProps,
  Field,
  ErrorMessage,
  FieldProps,
} from 'formik';
import {
  FormikInput,
  FormikTapisFileInput,
} from '../../../../ui-formik/FieldWrapperFormik';
import { v4 as uuidv4 } from 'uuid';
import * as Yup from 'yup';
import arrayStyles from './FileInputArrays.module.scss';
import styles from './FileInputs.module.scss';
import fieldArrayStyles from '../FieldArray.module.scss';
import formStyles from '../../../../ui-formik/FieldWrapperFormik/FieldWrapperFormik.module.css';
import { JobStep } from '..';

export type FieldWrapperProps = {
  fileInputArrayIndex: number;
  arrayHelpers: FieldArrayRenderProps;
};

const SourceUrlsField: React.FC<FieldWrapperProps> = ({
  fileInputArrayIndex,
  arrayHelpers,
}) => {
  const { values } = useFormikContext();
  const sourceUrls: Array<string> = useMemo(
    () =>
      !!(values as Partial<Jobs.ReqSubmitJob>).fileInputArrays
        ? (values as Partial<Jobs.ReqSubmitJob>).fileInputArrays![
            fileInputArrayIndex
          ].sourceUrls ?? []
        : [],
    [values, fileInputArrayIndex]
  );
  const { push } = arrayHelpers;
  const { modal, open, close } = useModal();
  const onSelect = useCallback(
    (systemId: string | null, files: Array<Files.FileInfo>) => {
      files.forEach((file) => {
        const newSourceUrl = `tapis://${systemId ?? ''}${file.path}`;
        if (!sourceUrls.some((sourceUrl) => sourceUrl === newSourceUrl)) {
          push(newSourceUrl);
        }
      });
    },
    [push, sourceUrls]
  );

  return (
    <FormGroup>
      <div className={arrayStyles.sourceUrls}>
        {sourceUrls.map((_, sourceUrlIndex) => {
          const sourceUrlName = `fileInputArrays.${fileInputArrayIndex}.sourceUrls.${sourceUrlIndex}`;
          return (
            <div key={sourceUrlName}>
              <Field name={sourceUrlName}>
                {({ field }: FieldProps) => (
                  <FormikTapisFileInput
                    {...field}
                    append={
                      <Button
                        size="sm"
                        onClick={() => arrayHelpers.remove(sourceUrlIndex)}
                        disabled={
                          sourceUrls.length === 1 && sourceUrlIndex === 0
                        }
                      >
                        <Icon name="close" />
                      </Button>
                    }
                  />
                )}
              </Field>
              <ErrorMessage name={sourceUrlName} className="form-field__help">
                {(message) => (
                  <div
                    className={`${formStyles['form-field__help']} ${styles.description}`}
                  >
                    {message}
                  </div>
                )}
              </ErrorMessage>
            </div>
          );
        })}
      </div>
      <div>
        <Button size="sm" onClick={() => arrayHelpers.push('')}>
          + Add Source URL
        </Button>
        <Button size="sm" onClick={() => open()}>
          + Browse for Files
        </Button>
      </div>
      {modal && <FileSelectModal toggle={close} onSelect={onSelect} />}
    </FormGroup>
  );
};

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
      title={name ?? 'File Input Array'}
      note={note}
      className={fieldArrayStyles.item}
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
      <FieldArray
        name={`fileInputArrays.${index}.sourceUrls`}
        render={(arrayHelpers) => (
          <FieldWrapper
            label="Source URLs"
            required={true}
            description="Input TAPIS files as pathnames, TAPIS URIs or web URLs"
          >
            <SourceUrlsField
              fileInputArrayIndex={index}
              arrayHelpers={arrayHelpers}
            />
          </FieldWrapper>
        )}
      />
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
  return jobInputArrays.some(
    (jobInputArray) => jobInputArray.name === input.name
  );
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
      className={styles['optional-input']}
    >
      <div className={fieldArrayStyles.description}>
        {inputArray.description ?? ''}
      </div>
      <FieldWrapper
        label="Source URLs"
        required={true}
        description="Input TAPIS files as pathnames, TAPIS URIs or web URLs"
      >
        {inputArray.sourceUrls?.map((sourceUrl) => (
          <Input bsSize="sm" defaultValue={sourceUrl} disabled={true} />
        ))}
      </FieldWrapper>
      <FieldWrapper
        label="Target Path"
        required={true}
        description="File mount path inside of running container"
      >
        <Input
          bsSize="sm"
          defaultValue={inputArray.targetDir}
          disabled={true}
        />
      </FieldWrapper>
      <Button onClick={() => onInclude()} disabled={included} size="sm">
        Include
      </Button>
      {included && (
        <div className={fieldArrayStyles.description}>
          This optional input array has already been included with your job file
          inputs.
        </div>
      )}
    </Collapse>
  );
};

const OptionalInputArrays: React.FC<{
  arrayHelpers: FieldArrayRenderProps;
}> = ({ arrayHelpers }) => {
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
      <div className={fieldArrayStyles.description}>
        These File Inputs are defined in the application and can be included
        with your job.
      </div>
      {optionalInputArrays.map((optionalInputArray) => {
        const alreadyIncluded = inputArrayIncluded(
          optionalInputArray,
          formFileInputArrays
        );
        const onInclude = () => {
          arrayHelpers.push(
            generateFileInputArrayFromAppInput(optionalInputArray)
          );
        };
        return (
          <div
            className={fieldArrayStyles.item}
            key={`optional-input-array-${optionalInputArray.name}`}
          >
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

const FixedInputArray: React.FC<{ inputArray: Apps.AppFileInputArray }> = ({
  inputArray,
}) => {
  return (
    <Collapse title={`${inputArray.name}`} className={styles['optional-input']}>
      <div className={fieldArrayStyles.description}>
        {inputArray.description ?? ''}
      </div>
      <FieldWrapper
        label="Source URLs"
        required={true}
        description="Input TAPIS files as pathnames, TAPIS URIs or web URLs"
      >
        {inputArray.sourceUrls?.map((sourceUrl, index) => (
          <Input
            bsSize="sm"
            defaultValue={sourceUrl}
            disabled={true}
            key={`fixed-input-array-${inputArray.name}-${index}`}
          />
        ))}
      </FieldWrapper>
      <FieldWrapper
        label="Target Directory"
        required={true}
        description="File mount path inside of running container"
      >
        <Input
          bsSize="sm"
          defaultValue={inputArray.targetDir}
          disabled={true}
        />
      </FieldWrapper>
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
      <div className={fieldArrayStyles.description}>
        These File Inputs are defined in the application and will automatically
        be included with your job. They cannot be removed or altered.
      </div>
      {fixedInputArrays.map((fixedInputArray) => (
        <div
          className={fieldArrayStyles.item}
          key={`fixed-input-${fixedInputArray.name}`}
        >
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
    requiredInputArrays.length > 0
      ? `Required (${requiredInputArrays.length})`
      : '';
  const jobInputArrays =
    (values as Partial<Jobs.ReqSubmitJob>)?.fileInputArrays ?? [];

  return (
    <Collapse
      open={requiredInputArrays.length > 0}
      title="File Inputs Arrays"
      note={`${jobInputArrays.length} items`}
      requiredText={requiredText}
      isCollapsable={requiredInputArrays.length === 0}
      className={fieldArrayStyles.array}
    >
      <div className={fieldArrayStyles.description}>
        These File Input Arrays will be submitted with your job.
      </div>
      {jobInputArrays.map((jobInputArray, index) => (
        <JobInputArrayField
          item={jobInputArray}
          index={index}
          remove={arrayHelpers.remove}
          key={`render-fileInputArrays.${index}`}
        />
      ))}
      <Button onClick={() => arrayHelpers.push({ sourceUrls: [''] })} size="sm">
        + Add File Input Array
      </Button>
    </Collapse>
  );
};

export const FileInputArrays: React.FC = () => {
  return (
    <div>
      <h2>File Input Arrays</h2>
      <FieldArray
        name="fileInputArrays"
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
    </div>
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
  const incompleteJobInputArrays = getIncompleteJobInputArrays(
    appFileInputArrays,
    jobFileInputArrays
  );
  const includedByDefault = getAppInputArraysIncludedByDefault(
    appFileInputArrays,
    jobFileInputArrays
  );
  return (
    <div key="file-input-arrays-summary">
      {jobFileInputArrays.map((jobFileInputArray) => {
        const complete = !incompleteJobInputArrays.some(
          (incompleteInput) => incompleteInput.name === jobFileInputArray.name
        );

        // If this job file input is complete, display its name or sourceUrl
        const key =
          jobFileInputArray.name ??
          (jobFileInputArray.sourceUrls
            ? `${jobFileInputArray.sourceUrls[0]}...`
            : undefined) ??
          jobFileInputArray.targetDir;
        // If this job file input is incomplete, display its name or sourceUrl
        const error = !complete
          ? `${key ?? 'A file input array'} is missing required information`
          : undefined;

        return (
          <StepSummaryField
            field={`${key} (${
              jobFileInputArray.sourceUrls?.length ?? '0'
            } files)`}
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

const validationSchema = Yup.object().shape({
  fileInputArrays: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().min(1).required('A fileInputArray name is required'),
      sourceUrls: Yup.array(
        Yup.string().min(1).required('A sourceUrl is required')
      ).min(1),
      targetDir: Yup.string().min(1).required('A targetDir is required'),
    })
  ),
});

const step: JobStep = {
  id: 'fileInputArrays',
  name: 'File Input Arrays',
  render: <FileInputArrays />,
  summary: <FileInputArraysSummary />,
  validationSchema,
  generateInitialValues: ({ job }) => ({
    fileInputArrays: job.fileInputArrays,
  }),
};

export default step;
