import React, { useEffect } from 'react';
import { WizardStep, useWizard } from 'tapis-ui/_wrappers/Wizard';
import { Wizard } from 'tapis-ui/_wrappers';
import { FieldWrapper } from 'tapis-ui/_common';
import { Input, Button } from 'reactstrap';
import { useForm, useFormContext, FormProvider } from 'react-hook-form';
import { mapInnerRef } from 'tapis-ui/utils/forms';
import * as Jobs from '@tapis/tapis-typescript-jobs';
import JobLauncherProvider, { useJobLauncher } from './JobLauncherProvider';

type JobLauncherWizardProps = {
  appId: string;
  appVersion: string;
  execSystemId: string;
  name: string;
};

type JobBasicsProps = {
  name: string;
  appId: string;
  appVersion: string;
  execSystemId: string;
};

const JobBasics: React.FC<JobBasicsProps> = ({ name, appId, appVersion }) => {
  const { register, reset, formState } = useFormContext<Jobs.ReqSubmitJob>();
  const { goToStep } = useWizard();
  const { errors } = formState;
  useEffect(
    () => {
      reset({ name, appId, appVersion });
      goToStep && goToStep(1);
    },
    [ reset, goToStep, name, appId, appVersion ]
  )
  return (
    <div>
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
    </div>
  );
};

const JobWizardStepWrapper: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const { nextStep } = useWizard();
  const methods = useForm<Jobs.ReqSubmitJob>();
  const { handleSubmit } = methods;
  const { jobSubmission, set, reset } = useJobLauncher();

  const formSubmit = (values: Jobs.ReqSubmitJob) => {
    set(values);
    nextStep && nextStep();
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(formSubmit)}>
        {children}
        <Button type="submit">Next</Button>
      </form>
    </FormProvider>
  );
};

const withJobWizardStep = (step: React.ReactNode): React.ReactNode => {
  return <JobWizardStepWrapper>{step}</JobWizardStepWrapper>;
};

const JobLauncherReset: React.FC<Partial<JobBasicsProps>> = ({ appId, appVersion }) => {
  const { reset } = useJobLauncher();
  useEffect(
    () => {
      reset();
    },
    [ appId, appVersion ]
  )
  return null;
}

const JobLauncherWizard: React.FC<JobLauncherWizardProps> = ({
  name,
  appId,
  appVersion,
  execSystemId,
}) => {
  const steps: Array<WizardStep> = [
    {
      id: 'step1',
      name: 'Job Stuff',
      render: withJobWizardStep(
        <JobBasics
          name={name}
          appId={appId}
          appVersion={appVersion}
          execSystemId={execSystemId}
        />
      ),
    },
    {
      id: 'step2',
      name: 'File Stuff',
      render: withJobWizardStep(<div>File Stuff</div>),
    },
  ];

  return (
    <JobLauncherProvider>
      <JobLauncherReset appId={appId} appVersion={appVersion} />
      <Wizard steps={steps} />
    </JobLauncherProvider>
  );
};

export default JobLauncherWizard;
