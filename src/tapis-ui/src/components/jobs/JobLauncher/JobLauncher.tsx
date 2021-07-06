import React, { useCallback } from 'react';
import { useSystems } from 'tapis-redux';
import { Config } from 'tapis-redux/types';
import { Jobs } from '@tapis/tapis-typescript';
import { useDispatch } from 'react-redux';
import { JobsSubmitCallback } from 'tapis-redux/jobs/submit/types'
import { Formik, Form,} from 'formik';
import { isTapisResponse } from 'tapis-redux/types';
import { useJobs } from 'tapis-redux';
import {
  Icon,
  LoadingSpinner,
} from 'tapis-ui/_common';
import JobFieldWrapper, { JobFieldWrapperProps } from './JobFieldWrapper';
import * as Yup from 'yup';
import {
  Button,
  Input,
} from 'reactstrap';

const JobSubmitStatus: React.FC = () => {
  const { submission } = useJobs();
  if (submission.result) {
    return <Icon name="approved-reverse" />
  } else if (submission.loading) {
    return <LoadingSpinner placement="inline" />
  } else if (submission.error) {
    return <Icon name="denied-reverse" />
  }
  return <></>;
}

export type OnSubmitCallback = (job: Jobs.Job) => any;

interface JobLauncherProps {
  config?: Config,
  initialValues?: Jobs.ReqSubmitJob,
  onSubmit?: OnSubmitCallback
}

const JobLauncherProps: React.FC<JobLauncherProps> = ({ config, initialValues, onSubmit }) => {
  const dispatch = useDispatch();
  const { submit, submission } = useJobs();
  const systemsHook = useSystems(config);
  const listSystems = systemsHook.list;
  // TODO: Temporary
  //const systems = systemsHook.systems;
  const systems = {
    results: [
      {
        id: 'tapisv3-storage'
      },
      {
        id: 'tapisv3-exec'
      }
    ]
  }

  // tapis-redux will make the callback with an agave response
  // this callback will extract the Job returned in the result field
  // of the response
  const submitDecoderCallback = useCallback<JobsSubmitCallback>(
    (result: Jobs.RespSubmitJob | Error) => {
      if (onSubmit && isTapisResponse<Jobs.RespSubmitJob>(result)) {
        const jobResponse: Jobs.RespSubmitJob = result as Jobs.RespSubmitJob;
        onSubmit(jobResponse.result);
      }
    },
    [onSubmit]
  )

  const validationSchema = (props) => {
    return Yup.lazy(values => {
      const schema = Yup.object({});
      return schema;
    })
  }
  const formSubmit = (values, { setSubmitting }) => {
    console.log(values);
    //dispatch(submit({ onSubmit: submitDecoderCallback, request }));
    setSubmitting(false);
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
        type: "select"
      },
      description: 'A TAPIS system that can run this application',
      label: 'Execution System',
      required: true,
      children: <Input>
        {
          systems.results.map(
            system => (
              <option>{system.id}</option>
            )
          )
        }
      </Input> 
    }
  ]

  return (
    <div>
      <h5>Job Submit</h5>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
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
           <Button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || submission.loading || submission.result != null}>
              Submit Job
              <JobSubmitStatus />
            </Button>
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
