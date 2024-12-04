import React, { useCallback } from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import {
  Details,
  detailsValidationSchema,
  detailsInitialValues,
} from '../_common';
import { FieldWrapper } from '@tapis/tapisui-common';
import { Form, Formik, useFormikContext, getIn } from 'formik';
import * as Yup from 'yup';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import validJson from 'utils/yupIsValidJson';
import { TaskFormProps } from '../Task';

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

const TapisJobFormikForm: React.FC<{ pipeline: Workflows.Pipeline }> = ({
  pipeline,
}) => {
  const { setFieldValue, errors } = useFormikContext();
  const onChange = useCallback(
    (value: string) => {
      setFieldValue('tapis_job_def', value);
    },
    [setFieldValue]
  );
  return (
    <Form id="newtask-form">
      <p>Tapis Job Task</p>
      <Details type={Workflows.EnumTaskType.TapisJob} pipeline={pipeline} />
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

const TapisJobTask: React.FC<TaskFormProps> = ({ onSubmit, pipeline }) => {
  const initialValues = {
    ...detailsInitialValues,
    type: Workflows.EnumTaskType.TapisJob,
    tapis_job_def: JSON.stringify(TAPIS_JOB_TEMPLATE),
  };
  const validationSchema = Yup.object({
    ...detailsValidationSchema,
    tapis_job_def: validJson().required('Tapis job definition is required'),
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
        <TapisJobFormikForm pipeline={pipeline} />
      </Formik>
    </div>
  );
};

export default TapisJobTask;
