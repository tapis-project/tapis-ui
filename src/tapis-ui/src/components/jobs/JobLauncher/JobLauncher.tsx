import React, { useEffect, useState, useCallback } from 'react';
import { useSystems } from 'tapis-redux';
import { Config } from 'tapis-redux/types';
import { Jobs } from '@tapis/tapis-typescript';
import { DescriptionList } from 'tapis-ui/_common';
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
import JobFieldWrapper, { JobFieldWrapperProps } from './JobFieldWrapper';
import * as Yup from 'yup';
import {
  Button,
  FormGroup,
  Label,
  Input,
  FormText,
  Badge,
  InputGroup,
  InputGroupAddon,
} from 'reactstrap';


type JobFieldType = {
  name: string,
  type: string,
  required: boolean, 
  description: string,
  label: string,
  addon?: React.ReactNode,
  addonType?: 'prepend' | 'append'
}

const jobFields: Array<JobFieldWrapperProps> = [
  {
    props: {
      name: 'name',
      type: 'string'
    },
    description: 'A name for this job',
    label: 'Name',
    required: true,
    children: <Input bsSize="sm" />
  },
  {
    props: {
      name: 'appId',
      type: 'string',  
    },
    description: 'The ID of the TAPIS application to run',
    label:'App ID',
    required: true,
    children: <Input bsSize="sm" />
  },
  {
    props: {
      name: 'appVersion',
      type: 'string',
    },
    description: 'The version of the application to run',
    label: 'App Version',
    required: true,
    children: <Input bsSize="sm" />
  },
  {
    props: {
      name: 'execSystemId',
      type: 'string',
    },
    description: 'A TAPIS system that can run this application',
    label: 'Execution System',
    required: true,
    children: <Input bsSize="sm" />
  }
]



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
    console.log("Validate", values);
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
           {
             jobFields.map(field => {
               return (
                 <JobFieldWrapper 
                   props={field.props}
                   label={field.label}
                   required={field.required}
                   children={field.children}
                   description={field.description}
                 />
               )
             })
           }
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
