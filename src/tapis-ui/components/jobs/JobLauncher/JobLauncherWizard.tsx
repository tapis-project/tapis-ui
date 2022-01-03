import React, { useEffect } from 'react';
import { useDetail as useAppDetail } from 'tapis-hooks/apps';
import { WizardStep, useWizard } from 'tapis-ui/_wrappers/Wizard';
import { Wizard } from 'tapis-ui/_wrappers';
import { Button } from 'reactstrap';
import { useForm, FormProvider } from 'react-hook-form';
import * as Jobs from '@tapis/tapis-typescript-jobs';
import JobLauncherProvider, { useJobLauncher } from './JobLauncherProvider';
import { JobBasics, JobBasicsSummary } from './steps/JobBasics';
import styles from './JobLauncherWizard.module.scss';

type JobLauncherWizardProps = {
  appId: string;
  appVersion: string;
};


const JobWizardStepWrapper: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const { nextStep, previousStep, currentStep, totalSteps } = useWizard();
  const methods = useForm<Jobs.ReqSubmitJob>();
  const { handleSubmit } = methods;
  const { set } = useJobLauncher();

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
const JobLauncherReset: React.FC<{appId: string; appVersion: string;}> = ({ appId, appVersion }) => {
  const { reset } = useJobLauncher();
  useEffect(
    () => {
      reset();
    },
    /* eslint-disable-nextline */
    [ reset, appId, appVersion ]
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
