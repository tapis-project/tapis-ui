import React from 'react';
import {
  FieldArray as TFieldArray,
  useFieldArray,
  useFormContext,
} from 'react-hook-form';
import { Apps, Jobs } from '@tapis/tapis-typescript';
import FieldWrapper from 'tapis-ui/_common/FieldWrapper';
import { Input, FormText, FormGroup, Label } from 'reactstrap';
import { mapInnerRef } from 'tapis-ui/utils/forms';
import { Button } from 'reactstrap';
import { useJobLauncher, StepSummaryField } from '../components';
import styles from './FileInputs.module.scss';
import fieldArrayStyles from '../FieldArray.module.scss';
import {
  generateFileInputFromAppInput,
  getIncompleteJobInputs,
  getAppInputsIncludedByDefault,
} from 'tapis-api/utils/jobFileInputs';
import { Collapse } from 'tapis-ui/_common';
import { v4 as uuidv4 } from 'uuid';

type FileInputFieldProps = {
  item: Jobs.JobFileInput;
  index: number;
  remove: () => void;
  required: boolean;
  inputMode: Apps.FileInputModeEnum | undefined;
};

const upperCaseFirstLetter = (str: string) => {
  const lower = str.toLowerCase();
  return `${lower.slice(0, 1).toUpperCase()}${lower.slice(1)}`;
};

const FileInputField: React.FC<FileInputFieldProps> = ({
  item,
  index,
  remove,
  required,
  inputMode,
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<Jobs.ReqSubmitJob>();
  const { name, description, sourceUrl, targetPath, autoMountLocal } = item;
  const itemError = errors?.fileInputs && errors.fileInputs[index];
  const note = `${
    inputMode ? upperCaseFirstLetter(inputMode) : 'User Defined'
  }`;
  return (
    <Collapse
      open={!sourceUrl}
      key={uuidv4()}
      title={name ?? 'File Input'}
      note={note}
    >
      <FieldWrapper
        label="Name"
        required={true}
        description={`${
          inputMode === Apps.FileInputModeEnum.Required
            ? 'This input is required and cannot be renamed'
            : 'Name of this input'
        }`}
        error={itemError?.name}
      >
        <Input
          bsSize="sm"
          defaultValue={name}
          {...mapInnerRef(
            register(`fileInputs.${index}.name`, {
              required: !remove
                ? 'This input is required and cannot be renamed'
                : undefined,
            })
          )}
          disabled={required}
        />
      </FieldWrapper>
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
      <FieldWrapper
        label="Description"
        required={false}
        description="Description of this input"
        error={itemError?.description}
      >
        <Input
          bsSize="sm"
          defaultValue={description}
          {...mapInnerRef(register(`fileInputs.${index}.description`))}
        />
      </FieldWrapper>
      <FormGroup check>
        <Label
          check
          className={`form-field__label ${styles.nospace}`}
          size="sm"
        >
          <Input
            type="checkbox"
            bsSize="sm"
            defaultChecked={autoMountLocal}
            {...mapInnerRef(register(`fileInputs.${index}.autoMountLocal`))}
          />{' '}
          Auto-mount Local
        </Label>
        <FormText
          className={`form-field__help ${styles.nospace}`}
          color="muted"
        >
          If this is true, the source URL will be mounted from the execution
          system's local file system
        </FormText>
      </FormGroup>
      {!required && (
        <Button onClick={() => remove()} size="sm" className={styles.remove}>
          Remove
        </Button>
      )}
    </Collapse>
  );
};

const isRequired = (fileInput: Jobs.JobFileInput, app: Apps.TapisApp) => {
  return (
    app.jobAttributes?.fileInputs?.some(
      (appInput) =>
        appInput.inputMode === Apps.FileInputModeEnum.Required &&
        appInput.name === fileInput.name
    ) ?? false
  );
};

const getFileInputsOfMode = (
  app: Apps.TapisApp,
  inputMode: Apps.FileInputModeEnum
) =>
  app.jobAttributes?.fileInputs?.filter(
    (appInput) => appInput.inputMode === inputMode
  ) ?? [];

type OptionalInputProps = {
  input: Apps.AppFileInput;
  included: boolean;
  onInclude: (input: Apps.AppFileInput) => any;
};

const OptionalInput: React.FC<OptionalInputProps> = ({
  input,
  included,
  onInclude,
}) => {
  return (
    <Collapse
      title={`${input.name} ${included ? '(included)' : ''}`}
      key={uuidv4()}
      className={styles['optional-input']}
    >
      <div className={styles.description}>{input.description ?? ''}</div>
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
      <Button onClick={() => onInclude(input)} disabled={included}>
        Include
      </Button>
    </Collapse>
  );
};

const FixedInput: React.FC<{ input: Apps.AppFileInput }> = ({ input }) => {
  return (
    <Collapse
      title={`${input.name}`}
      key={uuidv4()}
      className={styles['optional-input']}
    >
      <div className={styles.description}>{input.description ?? ''}</div>
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

const inputIncluded = (
  input: Apps.AppFileInput,
  jobInputs: Array<Jobs.JobFileInput>
) => {
  return jobInputs.some((jobInput) => jobInput.name === input.name);
};

export const FileInputs: React.FC = () => {
  const { job, app } = useJobLauncher();

  const optionalInputs = getFileInputsOfMode(
    app,
    Apps.FileInputModeEnum.Optional
  );
  const fixedInputs = getFileInputsOfMode(app, Apps.FileInputModeEnum.Fixed);

  const required =
    job.fileInputs?.filter((fileInput) => isRequired(fileInput, app)) ?? 0;
  const appendData: TFieldArray<Required<Jobs.ReqSubmitJob>, 'fileInputs'> = {
    name: '',
    sourceUrl: '',
    targetPath: '',
    autoMountLocal: true,
  };

  const { control, getValues } = useFormContext<Jobs.ReqSubmitJob>();
  const { fields, append, remove } = useFieldArray<
    Jobs.ReqSubmitJob,
    'fileInputs'
  >({
    control,
    name: 'fileInputs',
  });
  let requiredText = required > 0 ? `Required (${required})` : '';

  const formFileInputs = getValues()?.fileInputs ?? [];

  return (
    <div>
      <Collapse
        open={required > 0}
        title="File Inputs"
        note={`${fields.length} items`}
        requiredText={requiredText}
        isCollapsable={required === 0}
        className={fieldArrayStyles.array}
      >
        {fields.map((item, index) => {
          const required = isRequired(item, app);
          const removeCallback = () => remove(index);
          const inputMode =
            app.jobAttributes?.fileInputs?.find(
              (appInput) => appInput.name === item.name
            )?.inputMode ?? undefined;
          return (
            <div className={fieldArrayStyles.item}>
              <FileInputField
                item={item}
                index={index}
                remove={removeCallback}
                required={required}
                inputMode={inputMode}
              />
            </div>
          );
        })}
        <Button onClick={() => append(appendData)} size="sm">
          + Add File Input
        </Button>
      </Collapse>
      {!!optionalInputs.length && (
        <Collapse
          title="Optional File Inputs"
          note={`${optionalInputs.length} additional files`}
          className={fieldArrayStyles.array}
        >
          {optionalInputs.map((optionalInput) => {
            const alreadyIncluded = inputIncluded(
              optionalInput,
              formFileInputs
            );
            const onInclude = (input: Apps.AppFileInput) => {
              append(generateFileInputFromAppInput(optionalInput));
            };
            return (
              <div className={fieldArrayStyles.item}>
                <OptionalInput
                  input={optionalInput}
                  onInclude={onInclude}
                  included={alreadyIncluded}
                />
              </div>
            );
          })}
        </Collapse>
      )}
      {!!fixedInputs.length && (
        <Collapse
          title="Fixed File Inputs"
          note={`${fixedInputs.length} additional files`}
          className={fieldArrayStyles.array}
        >
          {fixedInputs.map((fixedInput) => (
            <div className={fieldArrayStyles.item}>
              <FixedInput input={fixedInput} />
            </div>
          ))}
        </Collapse>
      )}
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
    <div>
      {jobFileInputs.map((jobFileInput) => {
        const complete = !incompleteJobInputs.some(
          (incompleteInput) => incompleteInput.name === jobFileInput.name
        );
        // If this job file input is complete, display its name or sourceUrl
        const field = complete
          ? jobFileInput.name ?? jobFileInput.sourceUrl
          : undefined;
        // If this job file input is incomplete, display its name or sourceUrl
        const error = !complete
          ? `${
              jobFileInput.name ??
              jobFileInput.sourceUrl ??
              jobFileInput.targetPath ??
              'A file input'
            } is missing required information`
          : undefined;
        return <StepSummaryField field={field} error={error} key={uuidv4()} />;
      })}
      {missingRequiredInputs.map((requiredFileInput) => (
        <StepSummaryField
          error={`${requiredFileInput.name} is required`}
          key={uuidv4()}
        />
      ))}
      {includedByDefault.map((defaultInput) => (
        <StepSummaryField
          field={`${defaultInput.name} included by default`}
          key={uuidv4()}
        />
      ))}
    </div>
  );
};
