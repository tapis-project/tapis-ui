import { useState } from "react"
import { FormikInput, Icon, Collapse } from 'tapis-ui/_common';
import { FormikSelect } from 'tapis-ui/_common/FieldWrapperFormik';
import { useFormikContext, FieldArray } from 'formik';
import styles from './Details.module.scss';
import { Button } from 'reactstrap';
import { Workflows } from '@tapis/tapis-typescript';
import * as Yup from 'yup';

type DetailsProps = {
  type: Workflows.EnumTaskType;
  pipeline: Workflows.Pipeline;
};

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
  execution_profile: Yup.object({
    max_retries: Yup.number().min(-1).max(1000),
    max_exec_time: Yup.number().min(0),
    retry_policy: Yup.string().oneOf(Object.values(Workflows.EnumRetryPolicy)),
    invocation_mode: Yup.string().oneOf(
      Object.values(Workflows.EnumInvocationMode)
    ),
  }),
};

type ValueFromProps = {
  pipeline: Workflows.Pipeline
  index: number
  key: string
}

enum EnumValueFromTypes {
  Env = "env",
  Params = "params",
  TaskOutput = "task_output"
}

const ValueFrom: React.FC<ValueFromProps> = ({pipeline, index, key}) => {
  const [ valueFromType, setValueFromType ] = useState<string>()
  const { values } = useFormikContext()
  return (
    <div>
      <select>
        <option disabled value={''} selected={true}>
          -- select an option --
        </option>
        {Object.values(EnumValueFromTypes).map((type) => {
          return (
            <option id={`input.${index}`}>
              {type}
            </option>
          );
        })}
      </select>
    </div>
  )
}

type ReqTaskTransform = Workflows.ReqTask & {
  input: Array<{key: string, value: string}>
  output: Array<{type: string, value: string}>
}

const Details: React.FC<DetailsProps> = ({ type, pipeline }) => {
  const { values, setFieldValue } = useFormikContext<ReqTaskTransform>();
  const isSelectedDependency = (
    task_id: string,
    dependencies: Array<Workflows.TaskDependency>
  ) => {
    return dependencies.filter((dep) => dep.id === task_id).length > 0;
  };

  return (
    <div id={`details`}>
      <div className={styles["grid-2"]}>
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
      {/* <div id="task-input">
        <FieldArray
          name="input"
          render={(arrayHelpers) => {
            return (
              <Collapse title="Inputs">
                <div className={`${styles['key-val-inputs']}`}>
                  {values.input &&
                    values.input.length > 0 &&
                    values.input.map((_, i) => (
                      <div key={i} className={styles['key-val-input'] + " " + styles['grid-2']}>
                        <FormikInput
                          id={`input.${i}.key`}
                          name={`input.${i}.key`}
                          label="key"
                          required={true}
                          description={`key`}
                          aria-label="Input"
                          value=""
                        />
                        <FormikInput
                          id={`input.${i}.value`}
                          name={`input.${i}.value`}
                          label="value"
                          required={true}
                          description={`value`}
                          aria-label="Input"
                          value=""
                        />
                        <Button
                          className={styles['remove-button']}
                          type="button"
                          color="danger"
                          onClick={() => arrayHelpers.remove(i)}
                          size="sm"
                        >
                          <Icon name="trash" />
                        </Button>
                      </div>
                    ))}
                </div>
                <div style={{display: "inline-block"}}>
                  <div className={styles["grid-2"]}>
                    <Button
                      type="button"
                      className={styles['add-button']}
                      onClick={() => arrayHelpers.push({key: "", value: ""})}
                    >
                      Add input +
                    </Button>
                    <div>
                      <select>
                        <option disabled value={''} selected={true}>
                          -- select input value type --
                        </option>
                        <option id={`input-value-type-selector`} value={"literal"}>
                          value
                        </option>
                        {Object.values(EnumValueFromTypes).map((type) => {
                          return (
                            <option id={`input-value-type-selector`} value={type}>
                              value from {type}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>
              </Collapse>
            )
          }}
        />
      </div> */}
      <FieldArray
        name="depends_on"
        render={(arrayHelpers) => (
          <Collapse title="Task dependencies">
            <div className={styles['key-val-inputs'] + " " + styles["grid-2"]}>
              {values.depends_on &&
                values.depends_on.length > 0 &&
                values.depends_on.map((_, i) => (
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
                    >
                      <Icon name="trash" />
                    </Button>
                  </div>
                ))}
            </div>
            <Button
              type="button"
              disabled={
                (values.depends_on || []).length ===
                (pipeline.tasks || []).length
              }
              className={styles['add-button']}
              onClick={() => arrayHelpers.push({ id: '', can_fail: false })}
            >
              Add dependency +
            </Button>
          </Collapse>
        )}
      />
    </div>
  );
};

export default Details;
