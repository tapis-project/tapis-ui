import React, { useCallback } from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { Details } from '../_common';
import { FieldWrapper } from 'tapis-ui/_common';
import { Form, Formik, useFormikContext, getIn } from 'formik';
import * as Yup from 'yup';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import validJson from 'utils/yupIsValidJson';

const TAPIS_JOB_TEMPLATE = {
  name: '',
  appId: '',
  isMpi: false,
  jobType: 'FORK',
  memoryMB: 100,
  nodeCount: 1,
  appVersion: '0.1',
  maxMinutes: 10,
  description: '',
  coresPerNode: 1,
  parameterSet: {
    appArgs: [],
    envVariables: [],
    archiveFilter: {
      excludes: [],
      includes: [],
      includeLaunchFiles: true,
    },
    containerArgs: [],
    schedulerOptions: [],
  },
  fileInputs: [],
  fileInputArrays: [],
  archiveOnAppError: false,
};

const TapisJobFormikForm: React.FC = () => {
  const { setFieldValue, errors } = useFormikContext();
  const onChange = useCallback(
    (value) => {
      setFieldValue('tapis_job_def', value);
    },
    [setFieldValue]
  );
  return (
    <Form id="newtask-form">
      <p>Tapis Job Task</p>
      <Details type={Workflows.EnumTaskType.TapisJob} />
      <FieldWrapper
        label={'tapis job definition'}
        required={true}
        description={`The tapis job definition to run`}
        error={getIn(errors, 'tapis_job_def')}
      >
        <CodeMirror
          theme="light"
          value={JSON.stringify(TAPIS_JOB_TEMPLATE, null, 2)}
          height="200px"
          extensions={[json()]}
          onChange={onChange}
        />
      </FieldWrapper>
    </Form>
  );
};

const TapisJobTask: React.FC<{ onSubmit: any }> = ({ onSubmit }) => {
  const initialValues = {
    id: '',
    description: '',
    type: Workflows.EnumTaskType.TapisJob,
    tapis_job_def: JSON.stringify(TAPIS_JOB_TEMPLATE),
  };
  const validationSchema = Yup.object({
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
    tapis_job_def: validJson().required('Tapis job definition is required'),
    execution_profile: Yup.object({
      max_retries: Yup.number().min(-1).max(1000),
      max_exec_time: Yup.number().min(0),
      retry_policy: Yup.string().oneOf(
        Object.values(Workflows.EnumRetryPolicy)
      ),
      invocation_mode: Yup.string().oneOf(
        Object.values(Workflows.EnumInvocationMode)
      ),
    }),
  });

  return (
    <div id={`tapis-job-task`}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(props) => {
          let values = {
            ...props,
            tapis_job_def: JSON.parse(props.tapis_job_def),
          };
          onSubmit(values);
        }}
      >
        <TapisJobFormikForm />
      </Formik>
    </div>
  );
};

export default TapisJobTask;
