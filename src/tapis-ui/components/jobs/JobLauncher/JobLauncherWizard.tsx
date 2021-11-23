import React, { useEffect, useState } from 'react';
import { useList } from 'tapis-hooks/systems';
import { useDetail } from 'tapis-hooks/apps';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { Button } from 'reactstrap';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import StepWizard, { StepWizardChildProps } from 'react-step-wizard';
import * as Jobs from '@tapis/tapis-typescript-jobs';
import * as Apps from '@tapis/tapis-typescript-apps';
import AppSelectStep from './AppSelectStep';
import FileInputsStep from './FileInputsStep';

type StepWrapperProps = React.PropsWithChildren<{}> &
  Partial<StepWizardChildProps>;

const StepWrapper: React.FC<StepWrapperProps> = ({
  children,
  previousStep,
  nextStep,
}) => {
  const formMethods = useFormContext<Jobs.ReqSubmitJob>();
  const { handleSubmit } = formMethods;
  return (
    <form onSubmit={handleSubmit(() => {})}>
      {children}
      <Button className="btn btn-secondary" onClick={previousStep}>
        Previous
      </Button>
      <Button type="submit" className="btn btn-primary" onClick={nextStep}>
        Next
      </Button>
    </form>
  );
};

interface JobLauncherProps {
  appId: string;
  appVersion: string;
  name: string;
  execSystemId?: string;
}

const JobLauncherWizard: React.FC<JobLauncherProps> = ({
  appId,
  appVersion,
  name,
  execSystemId,
}) => {
  const {
    data: respSystems,
    isLoading: systemsLoading,
    error: systemsError,
  } = useList();
  const {
    data: respApp,
    isLoading: appLoading,
    error: appError,
  } = useDetail({
    appId,
    appVersion,
    select: 'jobAttributes',
  });

  const app = respApp?.result;
  const systems = respSystems?.result ?? [];

  const formMethods = useForm<Jobs.ReqSubmitJob>();
  const { reset, getValues } = formMethods;

  // Utility function to map an app spec's file inputs to a job's fileInput
  const mapAppInputs = (appInputs: Array<Apps.AppFileInput>) => {
    return appInputs.map((input) => {
      const { sourceUrl, targetPath, description, name } = input;
      const result: Jobs.JobFileInput = {
        sourceUrl,
        targetPath,
        description,
        name,
      };
      return result;
    });
  };

  const defaultValues: Jobs.ReqSubmitJob = {
    appId,
    appVersion,
    name,
    execSystemId,
    fileInputs: mapAppInputs(app?.jobAttributes?.fileInputs ?? []),
  };

  // Populating default values needs to happen as an effect
  // after initial render of field arrays
  useEffect(() => {
    reset(defaultValues);
  }, [reset, app?.id]); // eslint-disable-line react-hooks/exhaustive-deps


  console.log('Current job submission state', getValues());

  return (
    <QueryWrapper
      isLoading={appLoading || systemsLoading}
      error={appError ?? systemsError}
    >
      <FormProvider {...formMethods}>
        <StepWizard>
          <StepWrapper>
            <AppSelectStep
              app={app}
              name={name}
              systems={systems}
              execSystemId={execSystemId}
            />
          </StepWrapper>
          <StepWrapper>
            <FileInputsStep app={app} systems={systems} />
          </StepWrapper>
        </StepWizard>
      </FormProvider>
    </QueryWrapper>
  );
};

export default JobLauncherWizard;
