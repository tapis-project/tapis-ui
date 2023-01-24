import React, { useState } from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { Details } from '../_common';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { FormikInput, FieldWrapper } from 'tapis-ui/_common';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';

const TapisJobTask: React.FC<{ onSubmit: any }> = ({ onSubmit }) => {
  const [tapisJobDef, setTapisJobDef] = useState<string>('');
  const initialValues = {
    id: '',
    description: '',
    type: Workflows.EnumTaskType.TapisJob,
    tapis_job_def: {},
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
    tapis_job_def: Yup.object().required('Must provide a tapis job def'),
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
        onSubmit={onSubmit}
        enableReinitialize
      >
        <Form id="newtask-form">
          <p>Tapis Job Task</p>
          <Details type={Workflows.EnumTaskType.TapisJob} />
          <FieldWrapper
            label={'tapis job definition'}
            required={true}
            description={`The tapis job definition to run`}
          >
            <FormikInput
              name={`tapis_job_def`}
              label="message"
              required={true}
              type="hidden"
              description={''}
              aria-label="Input"
              value={tapisJobDef}
            />
            <CodeEditor
              value={tapisJobDef}
              language="json"
              placeholder="Please enter valid json"
              onChange={(e) => setTapisJobDef(e.target.value)}
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
        </Form>
      </Formik>
    </div>
  );
};

export default TapisJobTask;
