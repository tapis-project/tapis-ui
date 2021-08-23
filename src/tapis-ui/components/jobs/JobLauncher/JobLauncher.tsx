import React, { useEffect } from 'react';
import { useList } from 'tapis-hooks/systems';
import { useSubmit } from 'tapis-hooks/jobs';
import {
  LoadingSpinner,
} from 'tapis-ui/_common';
import FieldWrapper, { FieldWrapperProps } from 'tapis-ui/_common/FieldWrapper';
import { TapisSystem } from '@tapis/tapis-typescript-systems';
import { Jobs } from '@tapis/tapis-typescript';
import { Message } from 'tapis-ui/_common';
import {
  Button,
  Input,
} from 'reactstrap';
import { useForm, UseFormRegisterReturn } from 'react-hook-form'
import styles from './JobLauncher.module.scss';
import './JobLauncher.scss';

export type OnSubmitCallback = (job: Jobs.Job) => any;

interface JobLauncherProps {
  initialValues?: Jobs.ReqSubmitJob,
}

// rename ref key to innerRef for use with reactstrap input.
const mapInnerRef = (props: UseFormRegisterReturn) => {
  const {ref, ...rest} = props;
  return {innerRef: ref, ...rest}
}

const JobLauncher: React.FC<JobLauncherProps> = ({ initialValues={} }) => {
  const systemsListHook = useList({});
  const { submit, isLoading, error, data, reset } = useSubmit();

  const systems: Array<TapisSystem> = systemsListHook.data?.result ?? [];

  const formSubmit = (values: Jobs.ReqSubmitJob) => {
    submit({ request: values })
  }

  const {
    register,
    handleSubmit,
    reset: formReset,
    setValue,
    formState: { errors }
  } = useForm();

  useEffect(
    () => {
      reset();
      formReset();
      setValue('execSystemId', initialValues.execSystemId)
    },
    [ reset, initialValues ]
  )

  const nameField = register('name', {
    required: 'Name is a required field'
  });
  const appIdField = register('appId', {
    required: 'App ID is a required field'
  });
  const appVersionField = register('appVersion', {
    required: 'App Version is a required field'
  });
  const execSystemIdFIeld = register('execSystemId', {
    required: 'System ID is a required field'
  });

  const jobFields: Array<FieldWrapperProps> = [
    {
      description: 'A name for this job',
      label: 'Name',
      required: true,
      error: errors['name'],
      children: <Input bsSize="sm" defaultValue={initialValues.name} {...mapInnerRef(nameField)} />
    },
    {
      description: 'The ID of the TAPIS application to run',
      label:'App ID',
      required: true,
      error: errors['appId'],
      children: <Input bsSize="sm" data-testid="appId" defaultValue={initialValues.appId} {...mapInnerRef(appIdField)} />
    },
    {
      description: 'The version of the application to run',
      label: 'App Version',
      required: true,
      error: errors['appVersion'],
      children: <Input bsSize="sm" defaultValue={initialValues.appVersion} {...mapInnerRef(appVersionField)}/>
    },
    {
      description: 'A TAPIS system that can run this application',
      label: 'Execution System',
      required: true,
      error: errors['execSystemId'],
      children: <Input type="select" defaultValue={initialValues.execSystemId} {...mapInnerRef(execSystemIdFIeld)}>
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
          <form onSubmit={handleSubmit(formSubmit)}>
            {
              jobFields.map(field => {
                return (
                  <FieldWrapper 
                    label={field.label}
                    required={field.required}
                    description={field.description}
                    key={field.label}
                    error={field.error}
                  >{field.children}</FieldWrapper>
                )
              })
            }
            <div className={styles.status}>
              <Button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading || !!error}>
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
         </form>
    </div>
  );
};

export default JobLauncher;
