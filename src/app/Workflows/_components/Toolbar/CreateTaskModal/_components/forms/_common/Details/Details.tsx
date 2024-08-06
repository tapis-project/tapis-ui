import { useState } from 'react';
import {
  FormikInput,
  Icon,
  Collapse,
  FieldWrapper,
  SectionHeader,
} from '@tapis/tapisui-common';
import { FormikSelect } from '@tapis/tapisui-common';
import { useFormikContext, FieldArray } from 'formik';
import styles from './Details.module.scss';
import { Button, Input } from 'reactstrap';
import { Workflows } from '@tapis/tapis-typescript';
import * as Yup from 'yup';
import { InputType, ReqTaskTransform } from '../../../../CreateTaskModal';

export const detailsValidationSchema = {
  id: Yup.string()
    .min(1)
    .max(255)
    .required('A task requires an id')
    .matches(
      /^[a-zA-Z0-9_.-]+$/,
      "Must contain only alphanumeric characters and the following: '.', '_', '-'"
    ),
  type: Yup.string()
    .oneOf(Object.values(Workflows.EnumTaskType))
    .required('type is required'),
  description: Yup.string().min(1).max(1024),
  depends_on: Yup.array().of(
    Yup.object({
      id: Yup.string()
        .min(1)
        .max(128)
        .required("'id' of task dependency required"),
    })
  ),
  input: Yup.array().of(
    Yup.object({
      id: Yup.string()
        .matches(
          /^[_]?[A-Z0-9]{1,}[A-Z0-9_]{0,}$/g,
          "Uppercase, integers, and '_' only. Ids that start with '_' must be followed by one or more uppercase letters or numbers"
        )
        .required('Input id is required'),
      source: Yup.string()
        .oneOf(['literal', 'env', 'params', 'task_output'])
        .required('Input source is required'),
      value: Yup.string().when('source', (source, field) => {
        if (source === 'literal') {
          return field
            .min(1)
            .required("Value is required for inputs of source type 'literal'");
        }
        return field;
      }),
      sourceKey: Yup.string().when('source', (source, field) => {
        if (source === 'env' || source === 'params') {
          return field
            .min(1)
            .required(
              "Source key is required for inputs of source type 'env' or 'params'"
            );
        }
        return field;
      }),
      task_id: Yup.string().when('source', (source, field) => {
        if (source === 'task_output') {
          return field
            .min(1)
            .required("Task id is required for inputs of type 'task_output'");
        }
        return field;
      }),
      output_id: Yup.string().when('source', (source, field) => {
        if (source === 'task_output') {
          return field
            .min(1)
            .required(
              "Output name is required for inputs of type 'task_output'"
            );
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
};

export type DetailsInitialValuesType = {
  id: string;
  description: string;
  type: Workflows.EnumTaskType;
  depends_on: Array<Workflows.TaskDependency>;
  input: Array<InputType>;
  output: { [key: string]: object };
};

export const detailsInitialValues = {
  id: '',
  description: '',
  type: '' as Workflows.EnumTaskType,
  depends_on: [] as Array<Workflows.TaskDependency>,
  input: [] as Array<InputType>,
  output: {},
};

enum EnumInputValueType {
  Literal = 'literal',
  Env = 'env',
  Params = 'params',
  TaskOutput = 'task_output',
}

type InputValueProps = {
  index: number;
  source: 'literal' | 'env' | 'params' | 'task_output';
  dependencies: Array<Workflows.TaskDependency>;
  env: { [key: string]: object };
};

const InputValue: React.FC<InputValueProps> = ({
  index,
  source,
  dependencies,
  env = {},
}) => {
  return (
    <div id={`input-value-source-${index}`}>
      <h3>Input #{`${index + 1}`}</h3>
      <div className={styles['grid-2']}>
        <FormikInput
          id={`input.${index}.id`}
          name={`input.${index}.id`}
          label="input id"
          required={true}
          description={`Id of the input`}
          aria-label="Input"
          value=""
        />
        <FormikInput
          id={`input.${index}.source`}
          name={`input.${index}.source`}
          label="source"
          required
          description={`Input value source`}
          aria-label="Input"
          disabled
          value={source}
        />
      </div>
      <div id={`input-value-source-${index}`}>
        {source === EnumInputValueType.Literal && (
          <FormikInput
            id={`input.${index}.value`}
            name={`input.${index}.value`}
            label="value"
            required={true}
            description={`Value`}
            aria-label="Input"
            value=""
          />
        )}
        {source === EnumInputValueType.Env && (
          <div className={styles['grid-2']}>
            <FormikSelect
              name={`input.${index}.sourceKey`}
              label={'env key'}
              required={true}
              description={'The environment variable to use as input'}
            >
              <option disabled value={''} selected={true}>
                -- select an option --
              </option>
              {Object.keys(env).map((envVar) => {
                return <option value={envVar}>{envVar}</option>;
              })}
            </FormikSelect>
            <div></div>
          </div>
        )}
        {source === EnumInputValueType.Params && (
          <FormikInput
            id={`input.${index}.sourceKey`}
            name={`input.${index}.sourceKey`}
            label={`${source} key`}
            required
            description={'Workflow submission parameter name'}
            aria-label="Input"
            value={source}
          />
        )}
        {source === EnumInputValueType.TaskOutput && (
          <div className={styles['grid-2']}>
            <FormikSelect
              name={`input.${index}.task_id`}
              label={'task id'}
              required={true}
              description={'The id of the task '}
            >
              <option disabled value={''} selected={true}>
                -- select an option --
              </option>
              {dependencies.map((task) => {
                return <option value={task.id}>{task.id}</option>;
              })}
            </FormikSelect>
            <FormikInput
              id={`input.${index}.output_id`}
              name={`input.${index}.output_id`}
              label="output name"
              required
              description={'Name of the task output'}
              aria-label="Input"
              value=""
            />
          </div>
        )}
      </div>
    </div>
  );
};

type DetailsProps = {
  type: Workflows.EnumTaskType;
  pipeline: Workflows.Pipeline;
};

const Details: React.FC<DetailsProps> = ({ type, pipeline }) => {
  const [selectedInputValueType, setSelectedInputValueType] = useState<
    string | undefined
  >(undefined);
  const { values } = useFormikContext<ReqTaskTransform>();
  const isSelectedDependency = (
    task_id: string | undefined,
    dependencies: Array<Workflows.TaskDependency>
  ) => {
    return dependencies.filter((dep) => dep.id === task_id).length > 0;
  };

  const inputDependsOnTaskDependency = (
    inputs: Array<InputType>,
    dep: Workflows.TaskDependency
  ) => {
    let inputHasDependency = false;
    inputs.forEach((input: InputType) => {
      if (input.task_id && input.task_id === dep.id) {
        inputHasDependency = true;
        return;
      }
    });
    return inputHasDependency;
  };

  return (
    <div id={`details`}>
      <div className={styles['grid-2']}>
        <FormikInput
          name={`id`}
          label="task id"
          required={true}
          description={`id of the task`}
          aria-label="Input"
          value=""
        />
        <FormikInput
          name={`type`}
          label="type"
          required={true}
          disabled
          description="Task type"
          aria-label="Input"
          value={type}
        />
      </div>
      <FormikInput
        name={`description`}
        label="description"
        required={false}
        description={``}
        aria-label="Input"
        type="textarea"
        value=""
      />
      <div className={styles['section-container']}>
        <Collapse title="Dependencies & Task I/O">
          <div id={'task-dependencies'}>
            <FieldArray
              name="depends_on"
              render={(arrayHelpers) => (
                <div>
                  <SectionHeader className={styles['header']}>
                    <span>Dependencies</span>
                  </SectionHeader>
                  <div
                    className={
                      styles['key-val-inputs'] + ' ' + styles['grid-2']
                    }
                  >
                    {values.depends_on && values.depends_on.length > 0 ? (
                      values.depends_on.map((dep, i) => (
                        <div key={i} className={styles['key-val-input']}>
                          <FormikSelect
                            name={`depends_on.${i}.id`}
                            label={'task id'}
                            required={true}
                            description={
                              'The id of the task this task is dependent upon'
                            }
                          >
                            <option disabled value={''} selected={true}>
                              -- select an option --
                            </option>
                            {Object.values(pipeline.tasks || []).map((task) => {
                              return (
                                <option
                                  disabled={isSelectedDependency(
                                    task.id,
                                    values.depends_on || []
                                  )}
                                  value={task.id}
                                >
                                  {task.id}
                                </option>
                              );
                            })}
                          </FormikSelect>
                          <Button
                            className={styles['remove-button']}
                            type="button"
                            color="danger"
                            onClick={() => arrayHelpers.remove(i)}
                            size="sm"
                            disabled={inputDependsOnTaskDependency(
                              values.input,
                              dep
                            )}
                          >
                            <Icon name="trash" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <i>
                        No dependcies selected.{' '}
                        <b>{(pipeline.tasks || []).length}</b> tasks available
                      </i>
                    )}
                  </div>
                  <Button
                    type="button"
                    disabled={
                      (values.depends_on || []).length ===
                      (pipeline.tasks || []).length
                    }
                    className={styles['add-button']}
                    onClick={() =>
                      arrayHelpers.push({ id: '', can_fail: false })
                    }
                  >
                    + Add dependency
                  </Button>
                </div>
              )}
            />
          </div>
          <div id="task-input">
            <FieldArray
              name="input"
              render={(arrayHelpers) => {
                return (
                  <div>
                    <SectionHeader className={styles['header']}>
                      <span>Inputs</span>
                    </SectionHeader>
                    <div className={styles['key-val-inputs']}>
                      {values.input &&
                        values.input.length > 0 &&
                        values.input.map((_, i) => (
                          <div key={i} className={styles['key-val-input']}>
                            <InputValue
                              index={i}
                              source={values.input[i].source}
                              dependencies={values.depends_on || []}
                              env={pipeline.env || {}}
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
                    <div>
                      <div className={styles['grid-2']}>
                        <FieldWrapper
                          label={'Input value type'}
                          required={true}
                          description={
                            'Input value type (literal value or value from source)'
                          }
                        >
                          <Input
                            type="select"
                            onChange={(e) => {
                              setSelectedInputValueType(e.target.value);
                            }}
                          >
                            <option
                              disabled
                              value={''}
                              selected={selectedInputValueType === undefined}
                            >
                              -- select input value type --
                            </option>
                            {Object.values(EnumInputValueType).map((type) => {
                              return (
                                <option
                                  id={`input-value-type-selector`}
                                  value={type}
                                  disabled={
                                    (type === 'task_output' &&
                                      (values.depends_on || []).length < 1) ||
                                    (type === 'env' &&
                                      Object.keys(pipeline.env || {}).length <
                                        1)
                                  }
                                >
                                  {type === EnumInputValueType.Literal
                                    ? `value (literal)`
                                    : `value from ${type}`}
                                </option>
                              );
                            })}
                          </Input>
                        </FieldWrapper>
                      </div>
                      <Button
                        type="button"
                        disabled={selectedInputValueType === undefined}
                        className={styles['add-button']}
                        onClick={() => {
                          arrayHelpers.push({
                            id: '',
                            value: '',
                            source: selectedInputValueType,
                            sourceKey: '',
                            task_id: '',
                            output_id: '',
                          });

                          setSelectedInputValueType(undefined);
                        }}
                      >
                        + Add input
                      </Button>
                    </div>
                  </div>
                );
              }}
            />
          </div>
        </Collapse>
      </div>
    </div>
  );
};

export default Details;
