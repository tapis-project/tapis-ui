import React from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { Details } from '../_common';
// import styles from '../../Task.module.scss';
import { FormikSelect } from 'tapis-ui/_common/FieldWrapperFormik';
import { FormikInput } from 'tapis-ui/_common';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';

const RequestTask: React.FC<{ onSubmit: any }> = ({ onSubmit }) => {
  const initialValues = {
    id: '',
    description: '',
    type: Workflows.EnumTaskType.Request,
    http_method: '',
    url: '',
  };
  const validationSchema = Yup.object();

  return (
    <div id={`request-task`}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        <Form id="newtask-form">
          <p>Request Task</p>
          <Details type={Workflows.EnumTaskType.Request} />
          <FormikSelect
            name={`http_method`}
            label={'http method'}
            required={true}
            description={'GET, POST, PUT, PATCH, DELETE'}
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
          <FormikInput
            name={`url`}
            label="url"
            required={true}
            description={`URL to which to send the request (without query string)`}
            aria-label="Input"
          />
        </Form>
      </Formik>
    </div>
  );
};

export default RequestTask;
