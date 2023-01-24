import React, { useState } from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { Details } from '../_common';
// import styles from '../../Task.module.scss';
import { FormikSelect } from 'tapis-ui/_common/FieldWrapperFormik';
import { FormikInput, FieldWrapper } from 'tapis-ui/_common';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import styles from './TapisActorTask.module.scss';
import CodeEditor from '@uiw/react-textarea-code-editor';

enum MessageDataType {
  String = 'string',
  Json = 'JSON',
}

const TapisActorTask: React.FC<{ onSubmit: any }> = ({ onSubmit }) => {
  const [message, setMessage] = useState<string>('');
  const [messageDataType, setMessageDataType] = useState<MessageDataType>(
    MessageDataType.Json
  );
  const initialValues = {
    id: '',
    description: '',
    type: Workflows.EnumTaskType.TapisActor,
    tapis_actor_id: '',
    tapis_actor_message: '',
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
    tapis_actor_id: Yup.string().required('Must provide a tapis actor id'),
    tapis_actor_message: Yup.string().required('Must provide a tapis actor id'),
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
    <div id={`tapis-actor-task`}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        <Form id="newtask-form">
          <p>Tapis Actor Task</p>
          <Details type={Workflows.EnumTaskType.TapisActor} />
          <FormikSelect
            name={`tapis_actor_id`}
            label={'tapis actor'}
            required={true}
            description={'The tapis actor you want to execute'}
          >
            <option disabled selected={true} value={''}>
              -- select an option --
            </option>
            {Object.values(Workflows.EnumHTTPMethod).map((method) => {
              // TODO Remove when supported
              const supported = ['get'];
              return (
                <option disabled={!supported.includes(method)} value={method}>
                  {method.toString().toUpperCase()}
                </option>
              );
            })}
          </FormikSelect>
          <FieldWrapper
            required={false}
            label={'message data type'}
            description={`The data type of the message to be sent. Use "Text" type for simple strings`}
          >
            <div className={styles['radio-button-container']}>
              <label>
                <input
                  type="radio"
                  checked={messageDataType === MessageDataType.Json}
                  defaultChecked={false}
                  onClick={() => {
                    setMessageDataType(MessageDataType.Json);
                  }}
                />{' '}
                JSON
              </label>
              <label>
                <input
                  type="radio"
                  checked={messageDataType === MessageDataType.String}
                  defaultChecked={false}
                  onClick={() => {
                    setMessageDataType(MessageDataType.String);
                  }}
                />{' '}
                Text
              </label>
            </div>
          </FieldWrapper>
          {messageDataType === MessageDataType.String ? (
            <FormikInput
              name={`tapis_actor_message`}
              label="message"
              required={true}
              description={
                'The string message you want to the Tapis actor to consume.`'
              }
              aria-label="Input"
              value={message}
            />
          ) : (
            <FieldWrapper
              label={'message'}
              required={true}
              description={`The json object you want to the Tapis actor to consume.`}
            >
              <FormikInput
                name={`tapis_actor_message`}
                label="message"
                required={true}
                type="hidden"
                description={''}
                aria-label="Input"
                value={message}
              />
              <CodeEditor
                value={message}
                language="json"
                placeholder="Please enter valid json"
                onChange={(e) => setMessage(e.target.value)}
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
          )}
        </Form>
      </Formik>
    </div>
  );
};

export default TapisActorTask;
