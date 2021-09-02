import React, { useEffect } from 'react';
import { useList } from 'tapis-hooks/systems';
import { useSubmit } from 'tapis-hooks/jobs';
import { useForm, UseFormRegisterReturn } from 'react-hook-form';
import FieldWrapper, { FieldWrapperProps } from 'tapis-ui/_common/FieldWrapper';
import { TapisSystem } from '@tapis/tapis-typescript-systems';
import { Jobs } from '@tapis/tapis-typescript';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { Button, Input } from 'reactstrap';

export type OnSubmitCallback = (job: Jobs.Job) => any;

interface JobLauncherProps {
  appId: string;
  appVersion: string;
  name: string;
  execSystemId?: string;
}

// rename ref key to innerRef for use with reactstrap input.
const mapInnerRef = (props: UseFormRegisterReturn) => {
  const { ref, ...rest } = props;
  return { innerRef: ref, ...rest };
};

const JobLauncher: React.FC<JobLauncherProps> = ({
  appId,
  appVersion,
  name,
  execSystemId,
}) => {
  const systemsListHook = useList({});
  const systems: Array<TapisSystem> = systemsListHook.data?.result ?? [];

  const { submit, isLoading, error, data } = useSubmit(appId, appVersion);
  const formSubmit = (values: Jobs.ReqSubmitJob) => {
    submit(values);
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const nameField = register('name', {
    required: 'Name is a required field',
  });
  const appIdField = register('appId', {
    required: 'App ID is a required field',
  });
  const appVersionField = register('appVersion', {
    required: 'App Version is a required field',
  });
  const execSystemIdFIeld = register('execSystemId', {
    required: 'System ID is a required field',
  });

  useEffect(() => {
    setValue('name', name);
    setValue('appId', appId);
    setValue('appVersion', appVersion);
    execSystemId && setValue('execSystemId', execSystemId);
  }, [setValue, name, appId, appVersion, execSystemId]);

  const jobFields: Array<FieldWrapperProps> = [
    {
      description: 'A name for this job',
      label: 'Name',
      required: true,
      error: errors['name'],
      children: (
        <Input bsSize="sm" defaultValue={name} {...mapInnerRef(nameField)} />
      ),
    },
    {
      description: 'The ID of the TAPIS application to run',
      label: 'App ID',
      required: true,
      error: errors['appId'],
      children: (
        <Input
          bsSize="sm"
          data-testid="appId"
          defaultValue={appId}
          {...mapInnerRef(appIdField)}
        />
      ),
    },
    {
      description: 'The version of the application to run',
      label: 'App Version',
      required: true,
      error: errors['appVersion'],
      children: (
        <Input
          bsSize="sm"
          defaultValue={appVersion}
          {...mapInnerRef(appVersionField)}
        />
      ),
    },
    {
      description: 'A TAPIS system that can run this application',
      label: 'Execution System',
      required: true,
      error: errors['execSystemId'],
      children: (
        <Input
          type="select"
          defaultValue={execSystemId}
          {...mapInnerRef(execSystemIdFIeld)}
        >
          {systems.map((system: TapisSystem) => (
            <option key={system.id}>{system.id}</option>
          ))}
        </Input>
      ),
    },
  ];

  return (
    <div>
      {!!systems.length && (
        <form onSubmit={handleSubmit(formSubmit)}>
          {jobFields.map((field) => {
            return (
              <FieldWrapper
                label={field.label}
                required={field.required}
                description={field.description}
                key={field.label}
                error={field.error}
              >
                {field.children}
              </FieldWrapper>
            );
          })}
          <SubmitWrapper
            error={error}
            isLoading={isLoading}
            success={
              data && `Successfully submitted job ${data?.result?.uuid ?? ''}`
            }
          >
            <Button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !!error}
            >
              Submit Job
            </Button>
          </SubmitWrapper>
        </form>
      )}
    </div>
  );
};

export default JobLauncher;
