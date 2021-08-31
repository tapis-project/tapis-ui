import React from 'react';
import { useList } from 'tapis-hooks/systems';
import { useSubmit } from 'tapis-hooks/jobs';
import { Formik, Form } from 'formik';
import FieldWrapper, { FieldWrapperProps } from 'tapis-ui/_common/FieldWrapper';
import { TapisSystem } from '@tapis/tapis-typescript-systems';
import { Jobs } from '@tapis/tapis-typescript';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import * as Yup from 'yup';
import { Button, Input } from 'reactstrap';

export type OnSubmitCallback = (job: Jobs.Job) => any;

interface JobLauncherProps {
  appId: string,
  appVersion: string,
  name: string,
  execSystemId: string
}

const JobLauncher: React.FC<JobLauncherProps> = ({ appId, appVersion, name, execSystemId }) => {
  const systemsListHook = useList({});
  const { submit, isLoading, error, data } = useSubmit(appId, appVersion);

  const systems: Array<TapisSystem> = systemsListHook.data?.result ?? [];

  const validationSchema = (props: React.PropsWithChildren<React.ReactNode>) => {
    return Yup.lazy((values: any) => {
      const schema = Yup.object({});
      return schema;
    })
  }
  const formSubmit = (values: any, { setSubmitting }: {setSubmitting: any}) => {
    submit(values as Jobs.ReqSubmitJob)
    setSubmitting(false);
  }

  const initialValues = Jobs.ReqSubmitJobFromJSON({ appId, appVersion, name, execSystemId });

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
        initialValues={initialValues}
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
            <SubmitWrapper 
              error={error}
              isLoading={isLoading}
              success={data && `Successfully submitted job ${data?.result?.uuid ?? ''}`}
            >
              <Button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || isLoading || !!error}>
                Submit Job
              </Button>
            </SubmitWrapper>
         </Form>
       )}
      </Formik>
    </div>
  );
};

export default JobLauncher;
