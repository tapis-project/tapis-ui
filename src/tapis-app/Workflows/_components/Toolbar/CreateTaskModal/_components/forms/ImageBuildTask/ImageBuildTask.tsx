import { Workflows } from '@tapis/tapis-typescript';
import { Form, Formik } from 'formik';
import React, { useContext, useState } from 'react';
import * as Yup from 'yup';
import { Details } from '../_common';
import { Builder, Context, Destination } from './';
import styles from './ImageBuildTask.module.scss';

type ImageBuildTaskProps = {
  onSubmit: (
    // Note: Requires the type of initialValues to fully satisfy the type below.
    // Because the type changes as we modify initial values, we use any
    reqTask: any
  ) => void;
};

// Note: Type hack. "builder" from string | null to string
type InitialValues = Partial<
  Omit<Workflows.ReqImageBuildTask, 'builder'> & {
    builder: string;
  }
>;

type ImageBuildContextType = {
  initialValues: InitialValues;
  setInitialValues: React.Dispatch<any>;
  validationSchema: Partial<Yup.ObjectSchema<any>>;
  setValidationSchema: React.Dispatch<any>;
};
export const ImageBuildContext = React.createContext(
  {} as ImageBuildContextType
);

export const useImageBuildTaskContext = () => {
  return { context: useContext(ImageBuildContext) };
};

const WithImageBuildContext: React.FC<ImageBuildTaskProps> = ({ onSubmit }) => {
  const defaultInitialValues = {
    id: '',
    description: '',
    type: Workflows.EnumTaskType.ImageBuild,
    builder: '',
    cache: false,
  };

  const defaultValidationSchema = Yup.object().shape({
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
    builder: Yup.string()
      .oneOf(Object.values(Workflows.EnumBuilder))
      .required('builder is required'),
    cache: Yup.boolean(),
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
    context: Yup.object({}).required('context is required'),
    destination: Yup.object({}).required('destination is required'),
  });
  const [initialValues, setInitialValues] = useState(defaultInitialValues);
  const [validationSchema, setValidationSchema] = useState<Yup.AnyObjectSchema>(
    defaultValidationSchema
  );

  return (
    <ImageBuildContext.Provider
      value={{
        initialValues,
        setInitialValues,
        validationSchema,
        setValidationSchema,
      }}
    >
      <ImageBuildTask onSubmit={onSubmit} />
    </ImageBuildContext.Provider>
  );
};

const ImageBuildTask: React.FC<ImageBuildTaskProps> = ({ onSubmit }) => {
  const { context } = useImageBuildTaskContext();

  return (
    <div id={`task-form`} className={styles['container']}>
      <Formik
        initialValues={context.initialValues}
        validationSchema={context.validationSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        <Form id="newtask-form">
          <p>Image Build Task</p>
          <div>
            <Details type={Workflows.EnumTaskType.ImageBuild} />
            <Builder />
          </div>
          <div className={styles['section']}>
            <h2>Context</h2>
            <Context />
          </div>
          <div className={styles['section']}>
            <h2>Destination</h2>
            <Destination />
          </div>
        </Form>
      </Formik>
    </div>
  );
};

export default WithImageBuildContext;
