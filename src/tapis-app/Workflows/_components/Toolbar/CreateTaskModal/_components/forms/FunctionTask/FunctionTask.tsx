import React from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import {
  Details,
  detailsValidationSchema,
  detailsInitialValues,
} from '../_common';
import { FormikSelect } from '@tapis/tapisui-common';
import {
  FormikInput,
  FieldWrapper,
  Icon,
  SectionHeader,
} from '@tapis/tapisui-common';
import { Form, Formik, FieldArray } from 'formik';
import * as Yup from 'yup';
import styles from './FunctionTask.module.scss';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { Button } from 'reactstrap';
import { encode } from 'base-64';
import { TaskFormProps } from '../Task';

// const Runtimes = Workflows.EnumRuntimeEnvironment

enum Runtimes {
  PythonSingularity = 'tapis/workflows-python-singularity:0.1.0',
  Python39 = 'python:3.9',
}

const FunctionTask: React.FC<TaskFormProps> = ({ pipeline, onSubmit }) => {
  // eslint-disable-next-line
  const defaultCode = `# Use the execution context to fetch input data, save data to outputs,\n# and terminate the task with the stdout and stderr functions\nfrom owe_python_sdk.runtime import execution_context as ctx`;
  const initialValues = {
    ...detailsInitialValues,
    type: Workflows.EnumTaskType.Function,
    code: defaultCode,
    command: '',
    installer: '',
    runtime: '',
    packages: [] as Array<string>,
  };
  const validationSchema = Yup.object({
    ...detailsValidationSchema,
    code: Yup.string().required('Must provide code for the task'),
    command: Yup.string().min(1),
    installer: Yup.string()
      .oneOf(Object.values(Workflows.EnumInstaller))
      .required('Package installer is required'),
    packages: Yup.array().of(
      Yup.string()
        .min(1)
        .max(128)
        .required(
          "The package's name and version are required: Ex. tapipy==1.20.0"
        )
    ),
    runtime: Yup.string()
      .oneOf(Object.values(Runtimes))
      .required('Runtime is required'),
  });

  return (
    <div id={`function-task`}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          onSubmit({ ...values, code: encode(values.code) });
        }}
        enableReinitialize
      >
        {({ setFieldValue, values }) => (
          <Form id="newtask-form">
            <p>Function Task</p>
            <div className={styles['section-container']}>
              <Details
                type={Workflows.EnumTaskType.Function}
                pipeline={pipeline}
              />
              <div className={styles['section']}>
                <SectionHeader className={styles['header']}>
                  <span>Runtime Environment </span>
                </SectionHeader>
                <div className={styles['grid-2']}>
                  <FormikSelect
                    name={`runtime`}
                    label={'runtime'}
                    required={true}
                    description={
                      'The runtime envrionment and language of the function'
                    }
                  >
                    <option disabled value={''} selected={true}>
                      -- select an option --
                    </option>
                    {Object.values(Runtimes).map((runtime) => {
                      return (
                        <option
                          value={runtime}
                          selected={runtime === values.runtime}
                        >
                          {runtime}
                        </option>
                      );
                    })}
                  </FormikSelect>
                  <FormikSelect
                    name={`installer`}
                    label={'installer'}
                    required={true}
                    description={'The package installer to use'}
                  >
                    <option disabled selected={true} value={''}>
                      -- select an option --
                    </option>
                    {Object.values(Workflows.EnumInstaller).map((installer) => {
                      return <option value={installer}>{installer}</option>;
                    })}
                  </FormikSelect>
                </div>
                <FieldArray
                  name="packages"
                  render={(arrayHelpers) => (
                    <div>
                      <div
                        className={
                          styles['package-inputs'] + ' ' + styles['grid-3']
                        }
                      >
                        {values.packages &&
                          values.packages.length > 0 &&
                          values.packages.map((_, index) => (
                            <div
                              key={index}
                              className={styles['package-input']}
                            >
                              <FormikInput
                                name={`packages.${index}`}
                                label="Package"
                                required={true}
                                description={`The package's name and version: Ex. tapipy==1.20.0`}
                                aria-label="Input"
                              />
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
                        className={styles['add-button']}
                        onClick={() => arrayHelpers.push('')}
                      >
                        + Add package
                      </Button>
                    </div>
                  )}
                />
              </div>
              <div className={styles['section']}>
                <SectionHeader className={styles['header']}>
                  <span>Execution </span>
                </SectionHeader>
                <FormikInput
                  name={`command`}
                  label="command"
                  required={false}
                  description={`single-line bash commmand to run before running the entrypoint code`}
                  aria-label="Input"
                  value=""
                  disabled
                />
                <FieldWrapper
                  label={'code'}
                  required={true}
                  description={`Code to execute`}
                >
                  <FormikInput
                    name={`code`}
                    label="code"
                    required={true}
                    type="hidden"
                    description={''}
                    aria-label="Input"
                    value={values.code}
                  />
                  <CodeEditor
                    value={values.code}
                    language={'python'}
                    placeholder={`Please enter valid code`}
                    onChange={(e) => {
                      setFieldValue('code', e.target.value);
                    }}
                    padding={15}
                    color="black"
                    style={{
                      fontSize: 12,
                      backgroundColor: '#f5f5f5',
                      fontFamily:
                        'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                    }}
                  />
                </FieldWrapper>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default FunctionTask;
