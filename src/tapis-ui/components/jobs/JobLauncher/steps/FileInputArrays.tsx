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
  generateFileInputArrayFromAppInput,
  getIncompleteJobInputArrays,
  getAppInputArraysIncludedByDefault,
} from 'tapis-api/utils/jobFileInputArrays';
import { Collapse } from 'tapis-ui/_common';
import { v4 as uuidv4 } from 'uuid';
import { upperCaseFirstLetter, reduceRecord } from './utils';


type FileInputArraySourceUrlsProps = {
  item: Jobs.JobFileInputArray;
  arrayIndex: number;
}

const FileInputArraySourceUrls: React.FC<FileInputArraySourceUrlsProps> = ({ item, arrayIndex }) => {
  const {
    register,
    control,
    formState: { errors }
  } = useFormContext();
  const itemError = errors?.fileInputArrays && errors.fileInputArrays[arrayIndex];
  const sourceUrlErrors = itemError?.sourceUrls;

  const { fields, append, remove } = useFieldArray({
    control,
    name: `fileInputArrays.${arrayIndex}.sourceUrls`
  });
  return (
    <FieldWrapper
      label="Source URLs"
      required={true}
      description="Input TAPIS files as pathnames, TAPIS URIs or web URLs"
      error={}
    >
      {fields?.map(
        (url, urlIndex) =>{ 
          return (
          <div>
            <Input
              bsSize="sm"
              defaultValue={reduceRecord(url)}
              {...mapInnerRef(
                register(`fileInputArrays.${arrayIndex}.sourceUrls.${urlIndex}`, {
                  required: 'There must be at least one Source URL, and none can be empty strings',
                })
              )}
            />
            <Button onClick={() => remove(urlIndex)} size="sm">Remove</Button>
          </div>
        ) }
      )}
      <div>
        <Button onClick={() => append('filename')} size="sm">
          + Add File Input
        </Button>
      </div>
    </FieldWrapper> 
  );
}

type FileInputArrayFieldProps = {
  item: Jobs.JobFileInputArray;
  index: number;
  remove: () => void;
  inputMode: Apps.FileInputModeEnum | undefined;
};

const FileInputArrayField: React.FC<FileInputArrayFieldProps> = ({
  item,
  index,
  remove,
  inputMode,
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<Jobs.ReqSubmitJob>();
  const { name, description, targetDir } = item;
  const isRequired = inputMode === Apps.FileInputModeEnum.Required;
  const itemError = errors?.fileInputArrays && errors.fileInputArrays[index];
  const note = `${
    inputMode ? upperCaseFirstLetter(inputMode) : 'User Defined'
  }`;
  return (
    <Collapse
      open={true}
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
            register(`fileInputArrays.${index}.name`, {
              required: !remove
                ? 'This input is required and cannot be renamed'
                : undefined,
            })
          )}
          disabled={isRequired}
        />
      </FieldWrapper>
      <FileInputArraySourceUrls
        item={item}
        arrayIndex={index}
      />
      <FieldWrapper
        label="Target Directory"
        required={true}
        description="File mount directory inside of running container"
        error={itemError?.targetDir}
      >
        <Input
          bsSize="sm"
          defaultValue={targetDir}
          {...mapInnerRef(
            register(`fileInputArrays.${index}.targetDir`, {
              required: 'Target Path is required',
            })
          )}
        />
      </FieldWrapper>
      <FieldWrapper
        label="Description"
        required={false}
        description="Description of this input array"
        error={itemError?.description}
      >
        <Input
          bsSize="sm"
          defaultValue={description}
          {...mapInnerRef(register(`fileInputArrays.${index}.description`))}
        />
      </FieldWrapper>
      {!isRequired && (
        <Button onClick={() => remove()} size="sm" className={styles.remove}>
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

type OptionalInputArrayProps = {
  input: Apps.AppFileInputArray;
  included: boolean;
  onInclude: (input: Apps.AppFileInputArray) => any;
};

const OptionalInputArray: React.FC<OptionalInputArrayProps> = ({
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
        label="Source URLs"
        required={true}
        description="Input TAPIS file as a pathname, TAPIS URI or web URL"
      >
        {!!input.sourceUrls && !!input.sourceUrls.length 
          ? input.sourceUrls?.map(
              (url) => (
                <Input bsSize="sm" defaultValue={url} disabled={true} />
              )
            )
          : <div>None specified</div>
        }
      </FieldWrapper>
      <FieldWrapper
        label="Target Path"
        required={true}
        description="File mount path inside of running container"
      >
        <Input bsSize="sm" defaultValue={input.targetDir} disabled={true} />
      </FieldWrapper>
      <Button onClick={() => onInclude(input)} disabled={included}>
        Include
      </Button>
    </Collapse>
  );
};

const FixedInputArray: React.FC<{ input: Apps.AppFileInputArray }> = ({ input }) => {
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
        {input.sourceUrls?.map(
            (url) => (
              <Input bsSize="sm" defaultValue={url} disabled={true} />
            )
        )}
      </FieldWrapper>
      <FieldWrapper
        label="Target Path"
        required={true}
        description="File mount path inside of running container"
      >
        <Input bsSize="sm" defaultValue={input.targetDir} disabled={true} />
      </FieldWrapper>
    </Collapse>
  );
};

const inputArrayIncluded = (
  input: Apps.AppFileInputArray,
  jobInputArrays: Array<Jobs.JobFileInputArray>
) => {
  return jobInputArrays.some((jobInputArray) => jobInputArray.name === input.name);
};

export const FileInputArrays: React.FC = () => {
  const { app } = useJobLauncher();

  const optionalInputArrays = getFileInputArraysOfMode(
    app,
    Apps.FileInputModeEnum.Optional
  );
  const fixedInputArrays = getFileInputArraysOfMode(app, Apps.FileInputModeEnum.Fixed);
  const requiredInputArrays = getFileInputArraysOfMode(
    app,
    Apps.FileInputModeEnum.Required
  );

  const appendData: TFieldArray<Required<Jobs.ReqSubmitJob>, 'fileInputArrays'> = {
    name: '',
    sourceUrls: [],
    targetDir: '',
  };

  const { control, getValues } = useFormContext<Jobs.ReqSubmitJob>();
  const { fields, append, remove } = useFieldArray<
    Jobs.ReqSubmitJob,
    'fileInputArrays'
  >({
    control,
    name: 'fileInputArrays',
  });
  let requiredText =
    requiredInputArrays.length > 0 ? `Required (${requiredInputArrays.length})` : '';

  const formFileInputs = getValues()?.fileInputArrays ?? [];

  return (
    <div>
      <Collapse
        open={requiredInputArrays.length > 0}
        title="File Inputs"
        note={`${fields.length} items`}
        requiredText={requiredText}
        isCollapsable={requiredInputArrays.length === 0}
        className={fieldArrayStyles.array}
      >
        {fields.map((item, index) => {
          const removeCallback = () => remove(index);
          const inputMode =
            app.jobAttributes?.fileInputArrays?.find(
              (appInput) => appInput.name === item.name
            )?.inputMode ?? undefined;
          return (
            <div className={fieldArrayStyles.item}>
              <FileInputArrayField
                item={item}
                index={index}
                remove={removeCallback}
                inputMode={inputMode}
              />
            </div>
          );
        })}
        <Button onClick={() => append(appendData)} size="sm">
          + Add File Input
        </Button>
      </Collapse>
      {!!optionalInputArrays.length && (
        <Collapse
          title="Optional File Inputs"
          open={true}
          note={`${optionalInputArrays.length} additional files`}
          className={fieldArrayStyles.array}
        >
          {optionalInputArrays.map((optionalInputArray) => {
            const alreadyIncluded = inputArrayIncluded(
              optionalInputArray,
              formFileInputs
            );
            const onInclude = (input: Apps.AppFileInputArray) => {
              append(generateFileInputArrayFromAppInput(optionalInputArray));
            };
            return (
              <div className={fieldArrayStyles.item}>
                <OptionalInputArray
                  input={optionalInputArray}
                  onInclude={onInclude}
                  included={alreadyIncluded}
                />
              </div>
            );
          })}
        </Collapse>
      )}
      {!!fixedInputArrays.length && (
        <Collapse
          title="Fixed File Inputs"
          open={true}
          note={`${fixedInputArrays.length} additional files`}
          className={fieldArrayStyles.array}
        >
          {fixedInputArrays.map((fixedInputArray) => (
            <div className={fieldArrayStyles.item}>
              <FixedInputArray input={fixedInputArray} />
            </div>
          ))}
        </Collapse>
      )}
    </div>
  );
};

export const FileInputArraysSummary: React.FC = () => {
  const { job, app } = useJobLauncher();
  const jobFileInputArrays = job.fileInputArrays ?? [];
  const appFileInputArrays = app.jobAttributes?.fileInputArrays ?? [];
  const missingRequiredInputs = appFileInputArrays.filter(
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
            `${jobFileInputArray.sourceUrls && jobFileInputArray.sourceUrls.length ? jobFileInputArray.sourceUrls[0] : ''}...`
          : undefined;
        // If this job file input is incomplete, display its name or sourceUrl
        const error = !complete
          ? `${
              jobFileInputArray.name ??
              (jobFileInputArray.sourceUrls && jobFileInputArray.sourceUrls.length && jobFileInputArray.sourceUrls[0]) ??
              jobFileInputArray.targetDir ??
              'A file input array'
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
