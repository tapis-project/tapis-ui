import React, { useEffect } from 'react';
import { useList } from 'tapis-hooks/systems';
import { useSubmit } from 'tapis-hooks/jobs';
import { Formik, Form,} from 'formik';
import {
  LoadingSpinner,
} from 'tapis-ui/_common';
import FieldWrapper, { FieldWrapperProps } from 'tapis-ui/_common/FieldWrapper';
import { TapisSystem } from '@tapis/tapis-typescript-systems';
import { Jobs } from '@tapis/tapis-typescript';
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
  initialValues?: Jobs.ReqSubmitJob,
}

const JobLauncher: React.FC<JobLauncherProps> = ({ initialValues={} }) => {
  const systemsListHook = useList({});
  const { submit, isLoading, error, data, reset } = useSubmit();

  const systems: Array<TapisSystem> = systemsListHook.data?.result ?? [];

  const validationSchema = (props: React.PropsWithChildren<React.ReactNode>) => {
    return Yup.lazy((values: any) => {
      const schema = Yup.object({});
      return schema;
    })
  }
  const formSubmit = (values: any, { setSubmitting }: {setSubmitting: any}) => {
    submit({ request: values })
    setSubmitting(false);
  }

  useEffect(
    () => {
      reset();
    },
    [ reset, initialValues ]
  )

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
          systems.map(
            (system: TapisSystem) => (
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
                disabled={isSubmitting || isLoading || !!error}>
                Submit Job
              </Button>
              {
                isLoading && <LoadingSpinner className="launcher__loading-spinner" placement="inline" />
              }
              { data && (
                <div className={styles.message}>
                  <Message canDismiss={false} type="success" scope="inline">Successfully submitted job {data?.result?.uuid || ''}</Message>
                </div>
              )}
              {error && (
                <div className={styles.message}>
                  <Message canDismiss={false} type="error" scope="inline">{(error as any).message ?? error}</Message>
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
