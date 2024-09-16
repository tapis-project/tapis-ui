import React, { useState } from 'react';
import { QueryWrapper } from '@tapis/tapisui-common';
import { Form, Formik, FieldArray } from 'formik';
import {
  FormikInput,
  Collapse,
  FieldWrapper,
  Icon,
} from '@tapis/tapisui-common';
import { Workflows } from '@tapis/tapis-typescript';
import * as Yup from 'yup';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import styles from '../CreatePipelineModel.module.scss';
import { FormikSelect } from '@tapis/tapisui-common';
import { Button, Input } from 'reactstrap';
import { ReqPipelineTransform, EnvVarType } from '../CreatePipelineModal';

type FormProps = {
  onSubmit: (reqPipeline: ReqPipelineTransform) => void;
  groupId: string;
};

const initialValues = {
  id: '',
  description: '',
  type: Workflows.EnumPipelineType.Workflow,
  archive_ids: [],
  env: [],
  execution_profile: {
    max_retries: 0,
    max_exec_time: 3600,
    invocation_mode: Workflows.EnumInvocationMode.Async,
    retry_policy: Workflows.EnumRetryPolicy.ExponentialBackoff,
  },
};

// TODO add to Tapis Workflows' OpenAPI spec
enum EnumEnvVarValueSource {
  SK = 'tapis-security-kernel',
}

const baseValidationSchema = {
  id: Yup.string()
    .min(1)
    .max(255)
    .required('An pipeline requires an id')
    .matches(
      /^[a-zA-Z0-9_.-]+$/,
      "Must contain only alphanumeric characters and the following: '.', '_', '-'"
    ),
  type: Yup.string()
    .oneOf(Object.values(Workflows.EnumPipelineType))
    .required('type is required'),
  description: Yup.string().min(1).max(1024),
  archive_ids: Yup.array().of(Yup.string()),
  env: Yup.array().of(
    Yup.object({
      id: Yup.string()
        .required('Env var id is required')
        .matches(
          /^[_]?[A-Z0-9]{1,}[A-Z0-9_]{0,}$/g,
          "Uppercase, integers, and '_' only. Ids may start with '_' but must be followed by one or more uppercase letters or numbers"
        ),
      valueType: Yup.string().required('Value type is required'),
      value: Yup.string().when('valueType', (valueType, field) => {
        if (valueType === 'value') {
          return field
            .min(1)
            .required("Value is required for env vars of value type 'value'");
        }
        return field;
      }),
      source: Yup.string().when('valueType', (valueType, field) => {
        if (valueType === 'source') {
          return field
            .min(1)
            .required('Source is required for env vars with no value');
        }
      }),
      sourceKey: Yup.string().when('valueType', (valueType, field) => {
        if (valueType === 'source') {
          return field
            .min(1)
            .required('Source key is required for env vars with no value');
        }
        return field;
      }),
    })
  ),
  execution_profile: Yup.object({
    max_retries: Yup.number().min(-1).max(1000),
    max_exec_time: Yup.number().min(0),
    retry_policy: Yup.string().oneOf(Object.values(Workflows.EnumRetryPolicy)),
    invocation_mode: Yup.string().oneOf(
      Object.values(Workflows.EnumInvocationMode)
    ),
  }),
  tasks: Yup.array(),
};

const validationSchema = Yup.object({
  ...baseValidationSchema,
});

enum EnumEnvVarValueType {
  Value = 'value',
  Source = 'source',
}

type EnvVarValueProps = {
  index: number;
  valueType: string;
};

const EnvVarValue: React.FC<EnvVarValueProps> = ({ index, valueType }) => {
  switch (valueType) {
    case EnumEnvVarValueType.Value:
      return (
        <EnvVarValueSource
          index={index}
          valueType={EnumEnvVarValueType.Value}
        />
      );
    case EnumEnvVarValueType.Source:
      return (
        <EnvVarValueSource
          index={index}
          valueType={EnumEnvVarValueType.Source}
        />
      );
    default:
      return (
        <EnvVarValueSource
          index={index}
          valueType={EnumEnvVarValueType.Value}
        />
      );
  }
};

const EnvVarValueSource: React.FC<EnvVarValueProps> = ({
  index,
  valueType,
}) => {
  return (
    <div id={`env-value-source-${index}`}>
      <h3>EnvVar #{`${index + 1}`}</h3>
      <div className={styles['grid-2']}>
        <FormikInput
          id={`env.${index}.id`}
          name={`env.${index}.id`}
          label="env var id"
          required={true}
          description={`Id of the env var. Ex) _MY_VAR, MY_VAR, 0, _MYVAR1`}
          aria-label="Input"
          value=""
        />
        <FormikInput
          id={`env.${index}.valueType`}
          name={`env.${index}.valueType`}
          label="value type"
          required
          description={`Input value source`}
          aria-label="Input"
          disabled
          value={valueType}
        />
      </div>
      <div id={`env-value-source-${index}`}>
        {valueType === EnumEnvVarValueType.Value && (
          <FormikInput
            id={`env.${index}.value`}
            name={`env.${index}.value`}
            label="value"
            required={true}
            description={`Value`}
            aria-label="Input"
            value=""
          />
        )}
        {valueType === EnumEnvVarValueType.Source && (
          <div className={styles['grid-2']}>
            <FormikSelect
              id={`env.${index}.source`}
              name={`env.${index}.source`}
              label={'env var value source'}
              required={true}
              description={'Source of the env var'}
            >
              <option disabled selected={true} value={''}>
                -- select a value source --
              </option>
              {Object.values(EnumEnvVarValueSource).map((valueSource) => {
                return <option value={valueSource}>{valueSource}</option>;
              })}
            </FormikSelect>
            <FormikInput
              id={`env.${index}.sourceKey`}
              name={`env.${index}.sourceKey`}
              label={`source key`}
              required
              description={`They id to the value source. Ex. an+sk+id`}
              aria-label="Input"
              value={''}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const PipelineForm: React.FC<FormProps> = ({ groupId, onSubmit }) => {
  const { data, isLoading, error } = Hooks.Pipelines.useList({ groupId }); // Fetch the archives
  const [selectedEnvVarValueType, setSelectedEnvVarValueType] = useState<
    string | undefined
  >(undefined);
  const archives = data?.result ?? [];

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize={true}
        onSubmit={onSubmit}
        render={({ values }) => (
          <Form id="newpipeline-form">
            <FormikInput
              name="id"
              label="pipeline id"
              required={true}
              description={``}
              aria-label="Input"
            />
            <FormikInput
              name="description"
              label="description"
              required={false}
              description={``}
              aria-label="Input"
              type="textarea"
              value=""
            />
            <FormikInput
              name="type"
              label=""
              value={Workflows.EnumPipelineType.Workflow}
              required={true}
              description={``}
              aria-label="Input"
              type="hidden"
            />
            <div className={styles['section-container']}>
              <Collapse title="Environment">
                <div id="pipeline-env-vars">
                  <FieldArray
                    name="env"
                    render={(arrayHelpers) => (
                      <div>
                        <div className={styles['key-val-env-vars']}>
                          {values.env &&
                            values.env.length > 0 &&
                            values.env.map((_, i) => (
                              <div
                                key={i}
                                className={styles['key-val-env-var']}
                              >
                                <EnvVarValue
                                  index={i}
                                  valueType={
                                    (values.env[i] as EnvVarType).valueType
                                  }
                                />
                                <Button
                                  className={styles['remove-button']}
                                  type="button"
                                  color="danger"
                                  disabled={false}
                                  onClick={() => arrayHelpers.remove(i)}
                                  size="sm"
                                >
                                  <Icon name="trash" />
                                </Button>
                              </div>
                            ))}
                        </div>
                        <div className={styles['grid-2']}>
                          <FieldWrapper
                            label={'Env var value type'}
                            required={true}
                            description={
                              'Env var value type (literal value or value from source)'
                            }
                          >
                            <Input
                              type="select"
                              onChange={(e) => {
                                setSelectedEnvVarValueType(e.target.value);
                              }}
                            >
                              <option
                                disabled
                                value={''}
                                selected={selectedEnvVarValueType === undefined}
                              >
                                -- select input value type --
                              </option>
                              {Object.values(EnumEnvVarValueType).map(
                                (type) => {
                                  return (
                                    <option
                                      id={`input-value-type-selector`}
                                      value={type}
                                    >
                                      {type === EnumEnvVarValueType.Value
                                        ? `value (literal)`
                                        : `value from ${type}`}
                                    </option>
                                  );
                                }
                              )}
                            </Input>
                          </FieldWrapper>
                        </div>
                        <Button
                          type="button"
                          disabled={selectedEnvVarValueType === undefined}
                          className={styles['add-button']}
                          onClick={() => {
                            arrayHelpers.push({
                              id: '',
                              value: '',
                              valueType: selectedEnvVarValueType,
                              source: '',
                              sourceKey: '',
                            });

                            setSelectedEnvVarValueType(undefined);
                          }}
                        >
                          + Add EnvVar
                        </Button>
                      </div>
                    )}
                  />
                </div>
              </Collapse>
            </div>
            {/* Support only exists for single archive pipeline for now */}
            <FormikSelect
              name="archive_ids[0]"
              label={'Archive'}
              required={false}
              description={
                'The archive to which pipeline results will be persisted'
              }
              disabled={archives.length === 0}
            >
              <option disabled selected={true} value={''}>
                {archives.length > 0
                  ? ' -- select an option -- '
                  : ' -- no archives available -- '}
              </option>
              {Object.values(archives).map((archive) => {
                return <option value={archive.id}>{archive.id}</option>;
              })}
            </FormikSelect>
            <div className={styles['section-container']}>
              <Collapse title="Execution Profile">
                <FormikInput
                  name="execution_profile.max_retries"
                  label="Max retries"
                  required={false}
                  description={`How many times the pipeline will run after failing`}
                  aria-label="Input"
                  type="number"
                  disabled
                />
                <FormikInput
                  name="execution_profile.max_exec_time"
                  label="Max execution time"
                  required={false}
                  description={`Max lifetime the pipeline is allowed to run`}
                  aria-label="Input"
                  type="number"
                  disabled
                />
                <FormikSelect
                  name="execution_profile.invocation_mode"
                  label={'Invocation mode'}
                  required={false}
                  description={
                    "Affects task execution concurrency. Option 'sync' results serial task execution."
                  }
                  disabled
                >
                  {/* TODO enable sync invo mode when implemented */}
                  {Object.values(Workflows.EnumInvocationMode).map((mode) => {
                    return (
                      <option
                        value={mode}
                        disabled={mode === Workflows.EnumInvocationMode.Sync}
                      >
                        {mode}
                      </option>
                    );
                  })}
                </FormikSelect>
                <FormikSelect
                  name="execution_profile.retry_policy"
                  label={'Retry policy'}
                  required={false}
                  description={'Backoff algorithm'}
                  disabled
                >
                  {Object.values(Workflows.EnumRetryPolicy).map((policy) => {
                    return <option value={policy}>{policy}</option>;
                  })}
                </FormikSelect>
              </Collapse>
            </div>
          </Form>
        )}
      />
    </QueryWrapper>
  );
};

export default PipelineForm;
