import React, { useEffect, useState, useCallback } from 'react';
import { useSystems } from 'tapis-redux';
import { Config } from 'tapis-redux/types';
import { Jobs } from '@tapis/tapis-typescript';
import { DescriptionList } from 'tapis-ui/_common';
import { Button, FormGroup } from 'reactstrap';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import JobSubmit from 'tapis-ui/components/jobs/JobSubmit';
import {
  AppIcon,
  Icon,
  LoadingSpinner,
  SectionMessage
} from 'tapis-ui/_common';
import JobFormField from './JobFormField';
import * as Yup from 'yup';

export type OnSubmitCallback = (job: Jobs.Job) => any;

interface JobLauncherProps {
  config?: Config,
  initialValues?: Jobs.ReqSubmitJob,
  onSubmit?: OnSubmitCallback
}

const JobLauncherProps: React.FC<JobLauncherProps> = ({ config, initialValues, onSubmit }) => {
  const dispatch = useDispatch();
  const systemsHook = useSystems(config);
  const listSystems = systemsHook.list;
  const systems = systemsHook.systems;

  useEffect(
    () => {
      // Make sure systems have been retrieved
      if (!systems.loading && !systems.error && !systems.results.length) {
        dispatch(listSystems({}));
      }
    },
    [ systems, dispatch ]
  )

  const validate = (values) => {
  }

  const formSubmit = (values, { setSubmitting }) => {
    console.log(values);
  }

  return (
    <div>
      <h5>Job Submit</h5>
      <Formik
        initialValues={initialValues}
        validate={validate}
        onSubmit={formSubmit}
      >
       {({ isSubmitting }) => (
         <Form>
           <JobFormField 
            addon={undefined} addonType={''} 
            description="Job Name" 
            label="Job Name"
            required={true}
            type="string" 
            name="name" />
           <ErrorMessage name="name" component="div" />
           <Field type="string" name="appId" />
           <ErrorMessage name="appId" component="div" />
           <Field type="string" name="appVersion" />
           <ErrorMessage name="appVersion" component="div" />
           <Field type="string" name="execSystemId" />
           <ErrorMessage name="execSystemId" component="div" />
           <button type="submit">Submit</button>
         </Form>
       )}
      </Formik>
    </div>
  );
};

JobLauncherProps.defaultProps = {
  config: null,
  initialValues: {},
  onSubmit: null
}

export default JobLauncherProps;
