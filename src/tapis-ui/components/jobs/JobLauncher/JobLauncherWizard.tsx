import React, { useEffect } from 'react';
import { useDetail as useAppDetail } from 'tapis-hooks/apps';
import { WizardStep, useWizard } from 'tapis-ui/_wrappers/Wizard';
import { Wizard } from 'tapis-ui/_wrappers';
import { FieldWrapper } from 'tapis-ui/_common';
import { Input, Button } from 'reactstrap';
import { useForm, useFormContext, FormProvider } from 'react-hook-form';
import { mapInnerRef } from 'tapis-ui/utils/forms';
import * as Jobs from '@tapis/tapis-typescript-jobs';
import JobLauncherProvider, { useJobLauncher } from './JobLauncherProvider';
import styles from './JobLauncherWizard.module.scss';

type JobLauncherWizardProps = {
  appId: string;
  appVersion: string;
};

type JobBasicsProps = {
  appId: string;
  appVersion: string;
};

const JobBasics: React.FC<JobBasicsProps> = ({ appId, appVersion }) => {
  const { register, reset, formState } = useFormContext<Jobs.ReqSubmitJob>();
  const { goToStep } = useWizard();
  const { errors } = formState;
  useEffect(
    () => {
      reset({ 
        name: `${appId}-${appVersion}-${new Date()
          .toISOString()
          .slice(0, -5)}`,
        appId,
        appVersion
      });
      goToStep && goToStep(1);
    },
    [ reset, goToStep, appId, appVersion ]
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

const JobBasicsSummary: React.FC = () => {
  const { jobSubmission } = useJobLauncher();
  const { name, appId, appVersion } = jobSubmission;
  return (
    <div>
      {name && appId && appVersion
        ? <div>
            <div>{name}</div>
            <div>{appId} v{appVersion}</div>
          </div>
        : <i>Incomplete</i>
      }
    </div>
  )
}

const JobWizardStepWrapper: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const { nextStep, previousStep, currentStep, totalSteps } = useWizard();
  const methods = useForm<Jobs.ReqSubmitJob>();
  const { handleSubmit } = methods;
  const { set, reset } = useJobLauncher();

  const formSubmit = (values: Jobs.ReqSubmitJob) => {
    set(values);
    nextStep && nextStep();
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(formSubmit)}>
        {children}
        <div className={styles.controls}>
          {!!currentStep && currentStep > 1 && (
            <Button onClick={previousStep} type="submit">Back</Button>
          )}
          {!!currentStep && !!totalSteps && currentStep < totalSteps && (
            <Button type="submit" color="primary">Continue</Button>
          )}
        </div>        
      </form>
    </FormProvider>
  );
};

/**
 * A component that tracks appId and appVersion changes and resets the job submission value
 * @param dependencies  Dependencies for trigger jobSubmission context reset
 * @returns null
 */
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

const withJobStepWizard = (step: React.ReactNode) => {
  return <JobWizardStepWrapper>{step}</JobWizardStepWrapper>
}

const JobLauncherWizard: React.FC<JobLauncherWizardProps> = ({
  appId,
  appVersion,
}) => {
  const { data: appData } = useAppDetail({ appId, appVersion });
  const appDetails = appData?.result;

  const steps: Array<WizardStep> = [
    {
      id: 'step1',
      name: 'Job Stuff',
      render: withJobStepWizard(
        <JobBasics
          appId={appId}
          appVersion={appVersion}
        />
      ),
      summary: <JobBasicsSummary />
    },
    {
      id: 'step2',
      name: 'File Stuff',
      render: withJobStepWizard(<div>File Stuff</div>),
      summary: <div />
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
