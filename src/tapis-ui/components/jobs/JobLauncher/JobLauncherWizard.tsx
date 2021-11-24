import React, { useEffect, useState, useCallback } from 'react';
import { useList } from 'tapis-hooks/systems';
import { useDetail } from 'tapis-hooks/apps';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { Button } from 'reactstrap';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import { Icon } from 'tapis-ui/_common';
import StepWizard, { StepWizardChildProps } from 'react-step-wizard';
import * as Jobs from '@tapis/tapis-typescript-jobs';
import * as Apps from '@tapis/tapis-typescript-apps';
import AppSelectStep from './AppSelectStep';
import FileInputsStep from './FileInputsStep';
import styles from './JobLauncherWizard.module.scss';



type StepInfo = {
  stepName: string;
  component: React.ReactNode;
  complete: boolean;
}

const StepHeader: React.FC<{
  steps: Array<StepInfo>,
  currentStep: number,
  goToNamedStep: (step: string) => void;
}> = ({ steps, currentStep, goToNamedStep }) => {
  return (
    <div className={styles.header}>
      {steps.map(
        (step, index) => (
          <Button color="link" onClick={() => goToNamedStep(step.stepName)}>
            {`${index + 1}. ${step.stepName}`}
          </Button>
        )
      )}
    </div>
  )
}

type StepWrapperProps = React.PropsWithChildren<{
  steps: Array<StepInfo>;
}> & 
  Partial<StepWizardChildProps>;

const StepWrapper: React.FC<StepWrapperProps> = ({
  children,
  steps,
  currentStep,
  nextStep,
  previousStep,
  goToNamedStep,
}) => {
  const formMethods = useFormContext<Jobs.ReqSubmitJob>();
  const { handleSubmit } = formMethods;
  
  // currentStep is ordinally 1 based. (First step is 1)
  const hasNext = currentStep! < steps.length;
  const hasPrevious = currentStep! > 1;

  return (
    <div>
      <StepHeader steps={steps} currentStep={currentStep!} goToNamedStep={goToNamedStep!} />
      <form onSubmit={handleSubmit(() => {})}>
        {children}
      </form>
      <div>
        <Button className="btn btn-secondary" onClick={previousStep} disabled={!hasPrevious}>
          Previous
        </Button>
        <Button type="submit" className="btn btn-primary" onClick={nextStep} disabled={!hasNext}>
          Next
        </Button>
      </div>
    </div>
  );
};

const jobInputComplete = (jobInput: Jobs.JobFileInput) => {
  return !!jobInput.name && !!jobInput.sourceUrl && !!jobInput.targetPath;
}

const fileInputsComplete = (app: Apps.TapisApp, job: Jobs.ReqSubmitJob) => {
  const required = app.jobAttributes?.fileInputs?.filter(input => input.inputMode === Apps.FileInputModeEnum.Required) ?? [];
  if (job.fileInputs?.some(jobInput => !jobInputComplete(jobInput))) {
    return false;
  }
  const incomplete = required.some(
    input => {
      const matchingJobInput = job.fileInputs?.find(jobInput => jobInput.name === input.name)
      if (!matchingJobInput) {
        // Required input was missing from job submission
        if (!!input.sourceUrl) {
          // The app input specifies a sourceUrl, so it's not required in the job submission
          return true;
        }
        return false;
      }
      if (matchingJobInput) {
        // Required input was found in job submission, Check to see if it's complete
        return !jobInputComplete(matchingJobInput);
      }
    }
  )
  if (incomplete) {
    // One or more job submissions file inputs was incomplete, yet required in app inputs
    // without having a sourceUrl specified in the app
    return false;
  }
  return true;
}


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

  const jobSubmission = getValues();

  const steps: Array<StepInfo> = [
    {
      stepName: 'Job Info',
      component: (
        <AppSelectStep
          app={app}
          name={name}
          systems={systems}
          execSystemId={execSystemId}
        />
      ),
      complete: !!jobSubmission.execSystemId && !!jobSubmission.name
    },
    {
      stepName: 'File inputs',
      component: <FileInputsStep app={app} systems={systems} />,
      complete: !!(app && fileInputsComplete(app, jobSubmission))
    }
  ]


  console.log('Current job submission state', getValues());

  return (
    <QueryWrapper
      isLoading={appLoading || systemsLoading}
      error={appError ?? systemsError}
    >
      <FormProvider {...formMethods}>
        <StepWizard>
          {steps.map(
            (step, index) => (
              <StepWrapper 

                stepName={step.stepName}
                steps={steps}
              >
                {step.component}
              </StepWrapper>
            )
          )}
        </StepWizard>
      </FormProvider>
    </QueryWrapper>
  );
};

export default JobLauncherWizard;
