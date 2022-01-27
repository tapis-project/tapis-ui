import React, { useCallback, useEffect } from 'react';
import { WizardStep } from 'tapis-ui/_wrappers/Wizard';
import { QueryWrapper, Wizard } from 'tapis-ui/_wrappers';
import { WizardSubmitWrapper } from 'tapis-ui/_wrappers/Wizard';
import { Apps, Jobs, Systems } from '@tapis/tapis-typescript';
import { JobStart, JobStartSummary } from './steps/JobStart';
import { FileInputs, FileInputsSummary } from './steps/FileInputs';
import { ExecSystem, ExecSystemSummary } from './steps/ExecSystem';
import { JobSubmission, JobSubmissionSummary } from './steps/JobSubmission';
import {
  generateRequiredFileInputsFromApp,
  fileInputsComplete,
} from 'tapis-api/utils/jobFileInputs';
import { jobRequiredFieldsComplete } from 'tapis-api/utils/jobRequiredFields';
import { Button } from 'reactstrap';
import { useSubmit } from 'tapis-hooks/jobs';
import { useDetail as useAppDetail } from 'tapis-hooks/apps';
import { useList as useSystemsList } from 'tapis-hooks/systems';
import { set, useJobLauncherActions } from 'tapis-hooks/jobs/jobLauncher';
import { useDispatch } from 'react-redux';
/*
import useJobLauncher, {
  JobLauncherProvider,
} from 'tapis-hooks/jobs/useJobLauncher';
*/
import { useJobLauncher, JobLauncherProvider } from 'tapis-hooks/jobs/jobLauncher';
import { withJobStepWrapper } from './components';

type JobLauncherWizardProps = {
  appId: string;
  appVersion: string;
};

const generateDefaultValues = (
  app: Apps.TapisApp,
  systems: Array<Systems.TapisSystem>
): Partial<Jobs.ReqSubmitJob> => {
  const systemDefaultQueue = systems.find(
    (system) => system.id === app.jobAttributes?.execSystemId
  )?.batchDefaultLogicalQueue;
  const defaultValues: Partial<Jobs.ReqSubmitJob> = {
    name: `${app.id}-${app.version}-${new Date().toISOString().slice(0, -5)}`,
    appId: app.id,
    appVersion: app.version,
    execSystemId: app.jobAttributes?.execSystemId,
    execSystemLogicalQueue:
      app.jobAttributes?.execSystemLogicalQueue ?? systemDefaultQueue,
    fileInputs: generateRequiredFileInputsFromApp(app),
  };
  return defaultValues;
};

const JobLauncherWizardSubmit: React.FC<{ app: Apps.TapisApp }> = ({ app }) => {
  const job = useJobLauncher();
  const isComplete =
    jobRequiredFieldsComplete(job) &&
    fileInputsComplete(app, job.fileInputs ?? []);
  const { isLoading, error, isSuccess, submit, data } = useSubmit(
    app.id!,
    app.version!
  );
  const onSubmit = useCallback(() => {
    submit(job as Jobs.ReqSubmitJob);
  }, [submit, job]);
  return (
    <WizardSubmitWrapper
      isLoading={isLoading}
      error={error}
      success={
        isSuccess
          ? `Successfully submitted job ${data?.result?.uuid ?? ''}`
          : ''
      }
      title={`Job Submission Summary`}
    >
      <Button disabled={!isComplete} color="primary" onClick={onSubmit}>
        Submit
      </Button>
    </WizardSubmitWrapper>
  );
};

const JobLauncherRender: React.FC<{
  app: Apps.TapisApp;
  systems: Array<Systems.TapisSystem>;
}> = React.memo(({ app, systems }) => {
  const { set } = useJobLauncherActions();
  useEffect(
    () => {
      const defaultValues: Partial<Jobs.ReqSubmitJob> = generateDefaultValues(
        app,
        systems
      );
      set(defaultValues);
    },
    [ app, systems, set ]
  )
  

  const steps: Array<WizardStep> = [
    {
      id: 'start',
      name: `Job Name`,
      render: withJobStepWrapper(<JobStart app={app} />),
      summary: <JobStartSummary />,
    },

    {
      id: 'execSystem',
      name: 'Execution System',
      render: withJobStepWrapper(<ExecSystem app={app} systems={systems} />),
      summary: <ExecSystemSummary />,
    },
    {
      id: 'fileInputs',
      name: 'File Inputs',
      render: withJobStepWrapper(<FileInputs app={app} />),
      summary: <FileInputsSummary app={app} />,
    },
    {
      id: 'jobSubmission',
      name: 'Job Submission',
      render: withJobStepWrapper(<JobSubmission app={app} />),
      summary: <JobSubmissionSummary />,
    },
  ];

  return (
    <Wizard
      steps={steps}
      memo={[app.id, app.version]}
      renderSubmit={<JobLauncherWizardSubmit app={app} />}
    />
  );
});

const JobLauncherWizard: React.FC<JobLauncherWizardProps> = ({
  appId,
  appVersion,
}) => {
  const { data, isLoading, error } = useAppDetail(
    { appId, appVersion },
    { refetchOnWindowFocus: false }
  );
  const {
    data: systemsData,
    isLoading: systemsIsLoading,
    error: systemsError,
  } = useSystemsList(
    { select: 'allAttributes' },
    { refetchOnWindowFocus: false }
  );
  const app = data?.result;
  const systems = systemsData?.result ?? [];
  return (
    <QueryWrapper
      isLoading={isLoading || systemsIsLoading}
      error={error || systemsError}
    >
      <JobLauncherProvider>
        <JobLauncherRender app={app!} systems={systems} />
      </JobLauncherProvider>
    </QueryWrapper>
  );
};

export default React.memo(JobLauncherWizard);
