import React, { useMemo, useCallback } from 'react';
import { Apps, Files, Jobs } from '@tapis/tapis-typescript';
import { Input, Button, FormGroup } from 'reactstrap';
import { generateFileInputArrayFromAppInput } from '../../../../utils/jobFileInputArrays';
import { Collapse, Icon, FieldWrapper, useModal } from '../../../../ui';
import { FileSelectModal } from '../../../../components';
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
import arrayStyles from './FileInputArrays.module.scss';
import styles from './FileInputs.module.scss';
import fieldArrayStyles from './FieldArray.module.scss';
import { useJobLauncher } from '../../../../components/jobs/JobLauncher/components';

export type FieldWrapperProps = {
  fileInputArrayIndex: number;
  arrayHelpers: FieldArrayRenderProps;
};

const SourceUrlsField: React.FC<FieldWrapperProps> = ({
  fileInputArrayIndex,
  arrayHelpers,
}) => {
  const { values, setFieldValue } =
    useFormikContext<Partial<Apps.ReqPostApp>>();

  const { modal, open, close } = useModal();
  const { push } = arrayHelpers;

  const sourceUrls: Array<string> = useMemo(
    () =>
      values.jobAttributes?.fileInputArrays?.[fileInputArrayIndex]
        ?.sourceUrls ?? [],
    [values, fileInputArrayIndex]
  );

  const onSelect = useCallback(
    (systemId: string | null, files: Array<Files.FileInfo>) => {
      files.forEach((file) => {
        const newSourceUrl = `tapis://${systemId ?? 'here'}${file.path}`;
        if (!sourceUrls.some((sourceUrl) => sourceUrl === newSourceUrl)) {
          push(newSourceUrl);
        }
      });
    },
    [push, sourceUrls]
  );

  const handleUrlChange = useCallback(
    (index: number, event: any) => {
      const newUrls = [...sourceUrls];
      newUrls[index] = event.target.value;
      setFieldValue(
        `jobAttributes.fileInputArrays.${fileInputArrayIndex}.sourceUrls`,
        newUrls
      );
    },
    [sourceUrls, setFieldValue, fileInputArrayIndex]
  );

  const addUrlField = () => {
    const newUrls = [...sourceUrls, ''];
    setFieldValue(
      `jobAttributes.fileInputArrays.${fileInputArrayIndex}.sourceUrls`,
      newUrls
    );
  };

  return (
    <FormGroup>
      <div className={arrayStyles.sourceUrls}>
        {sourceUrls.map((url, index) => (
          <div
            className={arrayStyles.inputMargin}
            key={`sourceUrl-${fileInputArrayIndex}-${index}`}
          >
            <Field
              name={`jobAttributes.fileInputArrays.${fileInputArrayIndex}.sourceUrls.${index}`}
            >
              {({ field }: FieldProps) => (
                <FormikTapisFileInput
                  {...field}
                  value={url}
                  onChange={(event: any) => handleUrlChange(index, event)}
                  append={
                    <Button
                      size="sm"
                      onClick={() => arrayHelpers.remove(index)}
                      disabled={sourceUrls.length === 1 && index === 0}
                    >
                      <Icon name="close" />
                    </Button>
                  }
                />
              )}
            </Field>

            <ErrorMessage
              name={`jobAttributes.fileInputArrays.${fileInputArrayIndex}.sourceUrls.${index}`}
              className="form-field__help"
            />
          </div>
        ))}
      </div>
      <div>
        <Button size="sm" style={{ marginRight: '5px' }} onClick={addUrlField}>
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

type AppInputArrayFieldProps = {
  item: Apps.AppFileInputArray;
  index: number;
  remove: (index: number) => Apps.AppFileInputArray | undefined;
};

const upperCaseFirstLetter = (str: string) => {
  const lower = str.toLowerCase();
  return `${lower.slice(0, 1).toUpperCase()}${lower.slice(1)}`;
};

const AppInputArrayField: React.FC<AppInputArrayFieldProps> = ({
  item,
  index,
  remove,
}) => {
  const { name, sourceUrls } = item;
  const inputMode: Apps.FileInputModeEnum | undefined = undefined;
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
        name={`jobAttributes.fileInputArrays.${index}.name`}
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
        name={`jobAttributes.fileInputArrays.${index}.sourceUrls`}
        render={(arrayHelpers) => (
          <FieldWrapper
            label="Source URLs"
            required={true}
            // eslint-disable-next-line no-template-curly-in-string
            description="Input TAPIS files as pathnames, TAPIS URIs or web URLs
            in the form of: 'tapis://systemId.path...'
            "
          >
            <SourceUrlsField
              fileInputArrayIndex={index}
              arrayHelpers={arrayHelpers}
            />
          </FieldWrapper>
        )}
      />
      <FormikInput
        name={`jobAttributes.fileInputArrays.${index}.targetDir`}
        label="Target Directory"
        required={true}
        description="File mount path inside of running container"
      />
      <FormikInput
        name={`jobAttributes.fileInputArrays.${index}.description`}
        label="Description"
        required={false}
        description="Description of this input"
      />
      {!isRequired && (
        <Button
          onClick={() => {
            console.log('Remove index', index);
            remove(index);
          }}
          size="sm"
        >
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
    (values as Partial<Apps.ReqPostApp>)?.jobAttributes?.fileInputArrays ?? [];

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

const AppInputArrays: React.FC<{ arrayHelpers: FieldArrayRenderProps }> = ({
  arrayHelpers,
}) => {
  const { values, setFieldValue } =
    useFormikContext<Partial<Apps.ReqPostApp>>();
  let requiredText = '';
  const appInputArrays =
    (values as Partial<Apps.ReqPostApp>)?.jobAttributes?.fileInputArrays ?? [];

  return (
    <Collapse
      open={false}
      title="File Inputs Arrays"
      note={`${appInputArrays.length} items`}
      requiredText={requiredText}
      isCollapsable={true}
      className={fieldArrayStyles.array}
    >
      <div className={fieldArrayStyles.description}>
        These File Input Arrays will be submitted with your job.
      </div>
      {appInputArrays.map((appInputArray, index) => (
        <AppInputArrayField
          item={appInputArray}
          index={index}
          remove={arrayHelpers.remove}
          key={`render-fileInputArrays.${index}`}
        />
      ))}
      <Button
        onClick={() => {
          const fileInputArrays = values.jobAttributes?.fileInputArrays || [];
          const newFileInputArray = { sourceUrls: [''] };
          const newFileInputArrays = [...fileInputArrays, newFileInputArray];
          setFieldValue('jobAttributes.fileInputArrays', newFileInputArrays);
        }}
        size="sm"
      >
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
        name="jobAttributes.fileInputArrays"
        render={(arrayHelpers) => {
          return (
            <>
              <AppInputArrays arrayHelpers={arrayHelpers} />
              <OptionalInputArrays arrayHelpers={arrayHelpers} />
              {/* <FixedInputArrays /> */}
            </>
          );
        }}
      />
    </div>
  );
};

export default FileInputArrays;
