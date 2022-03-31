import React, { useMemo } from 'react';
import { Apps, Jobs } from '@tapis/tapis-typescript';
import FieldWrapper from 'tapis-ui/_common/FieldWrapper';
import { Input } from 'reactstrap';
import { Button } from 'reactstrap';
import { useJobLauncher, StepSummaryField } from '../components';
import styles from './ArchiveFilter.module.scss';
import fieldArrayStyles from '../FieldArray.module.scss';
import {
  generateFileInputArrayFromAppInput,
  getIncompleteJobInputArrays,
  getAppInputArraysIncludedByDefault,
} from 'tapis-api/utils/jobFileInputArrays';
import { Collapse } from 'tapis-ui/_common';
import {
  FieldArray,
  useFormikContext,
  FieldArrayRenderProps,
  Field,
  ErrorMessage,
  FieldProps,
} from 'formik';
import { FormGroup, InputGroup, InputGroupAddon } from 'reactstrap';
import { FormikJobStepWrapper } from '../components';
import { FormikInput } from 'tapis-ui/_common/FieldWrapperFormik';
import { v4 as uuidv4 } from 'uuid';
import * as Yup from 'yup';
import formStyles from 'tapis-ui/_common/FieldWrapperFormik/FieldWrapperFormik.module.css';

export type FieldWrapperProps = {
  fileInputArrayIndex: number;
  arrayHelpers: FieldArrayRenderProps;
};

const SourceUrlsField: React.FC<FieldWrapperProps> = ({
  fileInputArrayIndex,
  arrayHelpers,
}) => {
  const { values } = useFormikContext();
  const sourceUrls: Array<string> = !!(values as Partial<Jobs.ReqSubmitJob>)
    .fileInputArrays
    ? (values as Partial<Jobs.ReqSubmitJob>).fileInputArrays![
        fileInputArrayIndex
      ].sourceUrls ?? []
    : [];
  return (
    <FormGroup>
      {sourceUrls.map((sourceUrl, sourceUrlIndex) => {
        const sourceUrlName = `fileInputArrays.${fileInputArrayIndex}.sourceUrls.${sourceUrlIndex}`;
        return (
          <>
            <Field name={sourceUrlName}>
              {({ field }: FieldProps) => (
                <InputGroup>
                  <Input {...field} bsSize="sm" />
                  <InputGroupAddon addonType="append">
                    <Button
                      size="sm"
                      onClick={() => arrayHelpers.remove(sourceUrlIndex)}
                      disabled={sourceUrls.length === 1 && sourceUrlIndex === 0}
                    >
                      Remove
                    </Button>
                  </InputGroupAddon>
                </InputGroup>
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
          </>
        );
      })}
      <Button size="sm" onClick={() => arrayHelpers.push('')}>
        + Add Source URL
      </Button>
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
      key={`fileInputArrays.${index}`}
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
      key={`optional-input-array-${inputArray.name}`}
      className={styles['optional-input']}
    >
      <div className={styles.description}>{inputArray.description ?? ''}</div>
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
        <div className={styles.description}>
          This optional input array has already been included with your job file
          inputs.
        </div>
      )}
    </Collapse>
  );
};

const OptionalInputArrays: React.FC<{ arrayHelpers: FieldArrayRenderProps }> =
  ({ arrayHelpers }) => {
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

const FixedInputArray: React.FC<{ inputArray: Apps.AppFileInputArray }> = ({
  inputArray,
}) => {
  return (
    <Collapse
      title={`${inputArray.name}`}
      key={`fixed-input-${inputArray.name}`}
      className={styles['optional-input']}
    >
      <div className={styles.description}>{inputArray.description ?? ''}</div>
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

const Includes: React.FC = () => {
  const { values } = useFormikContext();

  const includes =
    (values as Partial<Jobs.ReqSubmitJob>)?.parameterSet?.archiveFilter?.includes ?? [];

  return (
    <FieldArray
      name="parameterSet.archiveFilter.includes"
      render={(arrayHelpers) => (
        <Collapse
          open={includes.length > 0}
          title="Includes"
          note={`${includes.length} items`}
          isCollapsable={true}
          className={fieldArrayStyles.array}
        >
          <FieldWrapper
            label="Includes"
            required={false}
            description="File patterns specified here will be included for archiving"
          >
            <div className={styles['array-group']}>
              {includes.map((include, index) => (
                <Field name={`parameterSet.archiveFilter.includes.${index}`}>
                  {({ field }: FieldProps) => (
                    <InputGroup>
                      <Input {...field} bsSize="sm" />
                      <InputGroupAddon addonType="append">
                        <Button
                          size="sm"
                          onClick={() => arrayHelpers.remove(index)}
                        >
                          Remove
                        </Button>
                      </InputGroupAddon>
                    </InputGroup>
                  )}
                </Field>
              ))}
            </div>
            <Button onClick={() => arrayHelpers.push('')} size="sm">
              + Add
            </Button>
          </FieldWrapper>
        </Collapse>
      )} 
    />
  );
};

export const ArchiveFilter: React.FC = () => {
  const { job } = useJobLauncher();

  const validationSchema = Yup.object().shape({
    parameterSet: Yup.object({
      archiveFilter: Yup.object({
        includes: Yup.array(Yup.string().min(1)),
        excludes: Yup.array(Yup.string()),
        includeLaunchFiles: Yup.boolean()
      })
    })
  });

  const initialValues = useMemo(
    () => ({
      parameterSet: {
        archiveFilter: job.parameterSet?.archiveFilter,
      }
    }),
    [job]
  );

  return (
    <FormikJobStepWrapper
      validationSchema={validationSchema}
      initialValues={initialValues}
    >
      <Includes />
    </FormikJobStepWrapper>
  );
};

export const ArchiveFilterSummary: React.FC = () => {
  const { job } = useJobLauncher();
  const includes = job.parameterSet?.archiveFilter?.includes ?? [];
  return (
    <div>
        <StepSummaryField
          field={`Includes: ${includes.length}`}
          key={`archive-filter-includes-summary`}
        />
    </div>
  );
};
