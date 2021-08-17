import React, { useCallback } from 'react';
import { useSystems, useJobs } from 'tapis-redux';
import { isTapisResponse, Config } from 'tapis-redux/types';
import { Jobs } from '@tapis/tapis-typescript';
import { useDispatch } from 'react-redux';
import { Formik, Form,} from 'formik';
import {
  LoadingSpinner,
} from 'tapis-ui/_common';
import FieldWrapper, { FieldWrapperProps } from 'tapis-ui/_common/FieldWrapper';
import { Message } from 'tapis-ui/_common';
import * as Yup from 'yup';
import {
  Button,
  Input,
} from 'reactstrap';
import styles from './JobLauncher.module.scss';
import './JobLauncher.scss';

export type OnSubmitCallback = (job: Jobs.Job) => any;

interface JobLauncherProps {
  config?: Config,
  initialValues?: Jobs.ReqSubmitJob,
  onSubmit?: OnSubmitCallback
}

const JobLauncher: React.FC<JobLauncherProps> = ({ config=undefined, initialValues={}, onSubmit=undefined }) => {
  const dispatch = useDispatch();
  const { submit, submission } = useJobs();
  const systemsHook = useSystems(config);
  const systems = systemsHook.systems;

  // tapis-redux will make the callback with an agave response
  // this callback will extract the Job returned in the result field
  // of the response
  const submitDecoderCallback = useCallback(
    (result: Jobs.RespSubmitJob | Error) => {
      if (onSubmit && isTapisResponse<Jobs.RespSubmitJob>(result)) {
        const jobResponse: Jobs.RespSubmitJob = result as Jobs.RespSubmitJob;
        onSubmit(jobResponse?.result ?? {});
      }
    },
    [onSubmit]
  )

  const validationSchema = (props: React.PropsWithChildren<React.ReactNode>) => {
    return Yup.lazy((values: any) => {
      const schema = Yup.object({});
      return schema;
    })
  }
  const formSubmit = (values: any, { setSubmitting }: {setSubmitting: any}) => {
    dispatch(submit({ onSubmit: submitDecoderCallback, request: values }));
    setSubmitting(false);
  }

  const jobFields: Array<FieldWrapperProps> = [
    {
      props: {
        name: 'name',
        type: 'string',
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
      children: <Input bsSize="sm" data-testid="appId" />
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
            (system: any) => (
              <option key={system.id}>{system.id}</option>
            )
          )
        }
      </Input> 
    }
  ]

  return (
    <div>
      <Formik
        initialValues={initialValues ?? {}}
        enableReinitialize={true}
        validationSchema={validationSchema}
        onSubmit={formSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            {
              jobFields.map(field => {
                return (
                  <FieldWrapper 
                    props={field.props}
                    label={field.label}
                    required={field.required}
                    children={field.children}
                    description={field.description}
                    key={field.props.name}
                  />
                )
              })
            }
            <div className={styles.status}>
              <Button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || submission.loading || submission.result != null}>
                Submit Job
              </Button>
              {
                submission.loading && <LoadingSpinner className="launcher__loading-spinner" placement="inline" />
              }
              {submission.result && (
                <div className={styles.message}>
                  <Message canDismiss={false} type="success" scope="inline">Successfully submitted job {submission.result.uuid}</Message>
                </div>
              )}
              {submission.error && (
                <div className={styles.message}>
                  <Message canDismiss={false} type="error" scope="inline">{submission.error.message}</Message>
                </div>
              )}
            </div>
         </Form>
       )}
      </Formik>
    </div>
  );
};

export default JobLauncher;
