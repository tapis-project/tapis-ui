import { FormikInput, Icon, SectionHeader } from 'tapis-ui/_common';
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

const Details: React.FC<DetailsProps> = ({ type, pipeline }) => {
  const { values } = useFormikContext<Workflows.ReqTask>();
  const isSelectedDependency = (
    task_id: string,
    dependencies: Array<Workflows.TaskDependency>
  ) => {
    return dependencies.filter((dep) => dep.id === task_id).length > 0;
  };

  return (
    <div id={`details`}>
      <FormikInput
        name={`id`}
        label="task id"
        required={true}
        description={``}
        aria-label="Input"
        value=""
      />
      <FormikInput
        name={`description`}
        label="description"
        required={false}
        description={``}
        aria-label="Input"
        type="textarea"
        value=""
      />
      <FormikInput
        name={`type`}
        label="type"
        required={true}
        description=""
        aria-label="Input"
        type="hidden"
        value={type}
      />
      {/* Input */}
      {/* Output */}

      <SectionHeader className={styles['header']}>
        <span>
          Dependencies{' '}
          <span className={styles['count']}>
            {values.depends_on?.length || 0}
          </span>
        </span>
      </SectionHeader>
      <FieldArray
        name="depends_on"
        render={(arrayHelpers) => (
          <div>
            <div className={styles['key-val-inputs']}>
              {values.depends_on &&
                values.depends_on.length > 0 &&
                values.depends_on.map((_, index) => (
                  <div key={index} className={styles['key-val-input']}>
                    <FormikSelect
                      name={`depends_on.${index}.id`}
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
                      onClick={() => arrayHelpers.remove(index)}
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
          </div>
        )}
      />
    </div>
  );
};

export default Details;
