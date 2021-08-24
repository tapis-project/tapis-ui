import React from 'react';
import { useList } from 'tapis-hooks/systems';
import { useSubmit } from 'tapis-hooks/jobs';
import { Formik, Form,} from 'formik';
import FieldWrapper, { FieldWrapperProps } from 'tapis-ui/_common/FieldWrapper';
import { TapisSystem } from '@tapis/tapis-typescript-systems';
import { Jobs } from '@tapis/tapis-typescript';
import * as Yup from 'yup';
import { Input } from 'reactstrap';
import './JobLauncher.scss';
import { TapisError } from 'tapis-api/types';
import { TapisUISubmit } from 'tapis-ui/components';

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
    submit({ request: values })
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
            <TapisUISubmit
              isLoading={isLoading}
              error={error as TapisError}
              disabled={isSubmitting}
              success={data && `Successfully submitted job ${data?.result?.uuid ?? ''}`}
            >
              Submit Job
            </TapisUISubmit>
         </Form>
       )}
      </Formik>
    </div>
  );
};

export default JobLauncher;
