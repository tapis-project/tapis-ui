import { Workflows } from '@tapis/tapis-typescript';
import { Form, Formik } from 'formik';
import React, { useContext, useState } from 'react';
import * as Yup from 'yup';
import {
  Details,
  DetailsInitialValuesType,
  detailsValidationSchema,
  detailsInitialValues,
} from '../_common';
import { Builder, Context, Destination } from './';
import styles from './ImageBuildTask.module.scss';

type ImageBuildTaskProps = {
  onSubmit: (
    // Note: Requires the type of initialValues to fully satisfy the type below.
    // Because the type changes as we modify initial values, we use type 'any'
    reqTask: any
  ) => void;
  pipeline: Workflows.Pipeline;
};

// NOTE: Type hack. "builder" from string | null to string
type InitialValuesType = Partial<
  Omit<Workflows.ReqImageBuildTask, 'builder' | 'input'> & { builder: string }
> &
  DetailsInitialValuesType;

type ImageBuildContextType = {
  initialValues: InitialValuesType;
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

const WithImageBuildContext: React.FC<ImageBuildTaskProps> = ({
  onSubmit,
  pipeline,
}) => {
  const defaultInitialValues = {
    ...detailsInitialValues,
    type: Workflows.EnumTaskType.ImageBuild,
    builder: '',
    cache: false,
  };

  const defaultValidationSchema = Yup.object().shape({
    ...detailsValidationSchema,
    builder: Yup.string()
      .oneOf(Object.values(Workflows.EnumBuilder))
      .required('builder is required'),
    cache: Yup.boolean(),
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
      <ImageBuildTask onSubmit={onSubmit} pipeline={pipeline} />
    </ImageBuildContext.Provider>
  );
};

const ImageBuildTask: React.FC<ImageBuildTaskProps> = ({
  onSubmit,
  pipeline,
}) => {
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
            <Details
              type={Workflows.EnumTaskType.ImageBuild}
              pipeline={pipeline}
            />
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
