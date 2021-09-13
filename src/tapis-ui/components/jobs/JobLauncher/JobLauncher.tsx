import React, { useCallback, useEffect } from 'react';
import { useList } from 'tapis-hooks/systems';
import { useSubmit } from 'tapis-hooks/jobs';
import { useForm, useFormContext } from 'react-hook-form';
import FieldWrapper from 'tapis-ui/_common/FieldWrapper';
import { TapisSystem } from '@tapis/tapis-typescript-systems';
import { Jobs } from '@tapis/tapis-typescript';
import { useDetail } from 'tapis-hooks/apps';
import { SubmitWrapper, QueryWrapper } from 'tapis-ui/_wrappers';
import { Button, Input } from 'reactstrap';
import { mapInnerRef } from 'tapis-ui/utils/forms';
import FileInputs from './FileInputs';

export type OnSubmitCallback = (job: Jobs.Job) => any;

interface JobLauncherProps {
  appId: string;
  appVersion: string;
  name: string;
  execSystemId?: string;
}

const JobLauncher: React.FC<JobLauncherProps> = ({
  appId,
  appVersion,
  name,
  execSystemId,
}) => {
  const { data: systemsData, isLoading: systemsLoading, error: systemsError } = useList();
  const systems: Array<TapisSystem> = systemsData?.result ?? [];
  const { data: app, isLoading: appLoading, error: appError } = useDetail({
    appId, appVersion, select: "jobAttributes" 
  });

  const { submit, isLoading, error, data } = useSubmit(appId, appVersion);
  const formSubmit = (values: Jobs.ReqSubmitJob) => {
    //submit(values);
    console.log(values);
  };

  const {
    reset,
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const reactHookFormProps = {
    control,
    register,
    errors
  }

  // Populating default values needs to happen as an effect
  // after initial render of field arrays
  useEffect(
    () => {
      const tapisApp = app?.result;
      if (tapisApp) {
        reset({
          name,
          appId: tapisApp.id,
          appVersion: tapisApp.version,
          execSystemId,
          jobAttributes: {
            fileInputs: tapisApp.jobAttributes?.fileInputs ?? []
          }
        });
      }  
    },
    [ reset, app, name, execSystemId ]
  )

  return (
    <QueryWrapper
      isLoading={appLoading || systemsLoading}
      error={appError ?? systemsError}
    >
      <form onSubmit={handleSubmit(formSubmit)}>
        {/* Required fields */}
        <FieldWrapper
          description="A name for this job"
          label="Name"
          required={true}
          error={errors['name']}
        >
          <Input
            bsSize="sm"
            defaultValue={name}
            {...mapInnerRef(register('name', { required: 'Name is required' }))}
          />
        </FieldWrapper>
        <FieldWrapper
          description="The ID of the TAPIS application to run"
          label="App ID"
          required={true}
          error={errors['appId']}
        >
          <Input
            bsSize="sm"
            data-testid="appId"
            defaultValue={appId}
            {...mapInnerRef(
              register('appId', { required: 'App ID is required' })
            )}
          />
        </FieldWrapper>
        <FieldWrapper
          description="The version of the application to run"
          label="App Version"
          required={true}
          error={errors['appVersion']}
        >
          <Input
            bsSize="sm"
            defaultValue={appVersion}
            {...mapInnerRef(
              register('appVersion', { required: 'App version is required ' })
            )}
          />
        </FieldWrapper>
        <FieldWrapper
          description="A TAPIS system that can run this application"
          label="Execution System"
          required={true}
          error={errors['execSystemId']}
        >
          <Input
            type="select"
            defaultValue={execSystemId}
            {...mapInnerRef(
              register('execSystemId', {
                required: 'An execution system is required ',
              })
            )}
          >
            {systems.map((system: TapisSystem) => (
              <option key={system.id}>{system.id}</option>
            ))}
          </Input>
        </FieldWrapper>

        <FileInputs inputs={app?.result?.jobAttributes?.fileInputs ?? []} {...reactHookFormProps} />

        {/* Submit button */}
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
    </QueryWrapper>
  );
};

export default JobLauncher;
