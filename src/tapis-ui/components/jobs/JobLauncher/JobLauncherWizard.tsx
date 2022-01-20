import React, { useCallback } from 'react';
import { WizardStep } from 'tapis-ui/_wrappers/Wizard';
import { Wizard } from 'tapis-ui/_wrappers';
import { WizardSubmitWrapper } from 'tapis-ui/_wrappers/Wizard';
import { Apps, Jobs, Systems } from '@tapis/tapis-typescript';
import { JobStart, JobStartSummary } from './steps/JobStart';
import { FileInputs, FileInputsSummary } from './steps/FileInputs';
import { ExecSystem, ExecSystemSummary } from './steps/ExecSystem';
import {
  generateRequiredFileInputsFromApp,
  fileInputsComplete,
} from 'tapis-api/utils/jobFileInputs';
import { generateDefaultSystemAttributes } from 'tapis-api/utils/jobExecSystem';
import { jobRequiredFieldsComplete } from 'tapis-api/utils/jobRequiredFields';
import { useFormContext } from 'react-hook-form';
import { Button } from 'reactstrap';
import { useSubmit } from 'tapis-hooks/jobs';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import { useList as useSystemsList } from 'tapis-hooks/systems';
import { useDetail as useAppDetail } from 'tapis-hooks/apps';

type JobLauncherWizardProps = {
  appId: string;
  appVersion: string;
};

const generateDefaultValues = (
  app: Apps.TapisApp,
  systems: Array<Systems.TapisSystem>
): Partial<Jobs.ReqSubmitJob> => {
  const defaultValues: Partial<Jobs.ReqSubmitJob> = {
    name: `${app.id}-${app.version}-${new Date().toISOString().slice(0, -5)}`,
    appId: app.id,
    appVersion: app.version,
    execSystemId: app.jobAttributes?.execSystemId,
    fileInputs: generateRequiredFileInputsFromApp(app),
    ...generateDefaultSystemAttributes(app, systems)
  };
  return defaultValues;
};

const JobLauncherWizardSubmit: React.FC<{ app: Apps.TapisApp }> = ({ app }) => {
  const { getValues } = useFormContext<Jobs.ReqSubmitJob>();
  const job = getValues() as Jobs.ReqSubmitJob;
  const isComplete =
    jobRequiredFieldsComplete(job) &&
    fileInputsComplete(app, job.fileInputs ?? []);
  const { isLoading, error, isSuccess, submit, data } = useSubmit(
    app.id!,
    app.version!
  );
  const onSubmit = useCallback(() => {
    const job = getValues() as Jobs.ReqSubmitJob;
    submit(job);
  }, [submit, getValues]);
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

type JobLauncherWrapperProps = {
  app: Apps.TapisApp;
  systems: Array<Systems.TapisSystem>;
}

const JobLauncherWrapper: React.FC<JobLauncherWrapperProps> = ({app, systems}) => {
  const steps: Array<WizardStep> = [
    {
      id: 'start',
      name: `Job Name`,
      render: <JobStart app={app} />,
      summary: <JobStartSummary />,
    },
    {
      id: 'execSystem',
      name: 'Execution System',
      render: <ExecSystem app={app} systems={systems}/>,
      summary: <ExecSystemSummary />,
    },
    {
      id: 'fileInputs',
      name: 'File Stuff',
      render: <FileInputs app={app} />,
      summary: <FileInputsSummary />,
    },
  ];

  const defaultValues: Partial<Jobs.ReqSubmitJob> = generateDefaultValues(app, systems);

  return (
    <Wizard<Jobs.ReqSubmitJob>
      steps={steps}
      defaultValues={defaultValues}
      memo={[app.id, app.version]}
      renderSubmit={<JobLauncherWizardSubmit app={app} />}
    />
  );
}

const JobLauncherWizard: React.FC<JobLauncherWizardProps> = ({ appId, appVersion }) => {
  const { data, isLoading, error } = useAppDetail(
    { appId, appVersion },
    { refetchOnWindowFocus: false }
  );
  const { 
    data: systemsData, 
    isLoading: systemsIsLoading, 
    error: systemsError
  } = useSystemsList(
    { select: "allAttributes" },
    { refetchOnWindowFocus: false }
  );
  const app = data?.result;
  const systems = systemsData?.result ?? [];
  return (
    <QueryWrapper isLoading={isLoading || systemsIsLoading } error={error ?? systemsError}>
      <JobLauncherWrapper app={app!} systems={systems} />
    </QueryWrapper>
  )
};

export default React.memo(JobLauncherWizard);
