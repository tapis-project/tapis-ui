import React, { useCallback } from 'react';
import { WizardStep } from 'tapis-ui/_wrappers/Wizard';
import { Wizard } from 'tapis-ui/_wrappers';
import { Apps, Jobs } from '@tapis/tapis-typescript';
import { JobStart, JobStartSummary } from './steps/JobStart';
import { FileInputs, FileInputsSummary } from './steps/FileInputs';
import { ExecSystem, ExecSystemSummary } from './steps/ExecSystem';
import { generateRequiredFileInputsFromApp, fileInputsComplete } from 'tapis-api/utils/jobFileInputs';
import { jobRequiredFieldsComplete } from 'tapis-api/utils/jobRequiredFields';

type JobLauncherWizardProps = {
  app: Apps.TapisApp;
};

const generateDefaultValues = (app: Apps.TapisApp): Partial<Jobs.ReqSubmitJob> => {
  const defaultValues: Partial<Jobs.ReqSubmitJob> = {
    name: `${app.id}-${app.version}-${new Date().toISOString().slice(0, -5)}`,
    appId: app.id,
    appVersion: app.version,
    execSystemId: app.jobAttributes?.execSystemId,
    fileInputs: generateRequiredFileInputsFromApp(app)
  };
  return defaultValues;
}

const JobLauncherWizard: React.FC<JobLauncherWizardProps> = ({ app }) => {
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
      render: <ExecSystem app={app} />,
      summary: <ExecSystemSummary />,
    },
    {
      id: 'fileInputs',
      name: 'File Stuff',
      render: <FileInputs app={app} />,
      summary: <FileInputsSummary />,
    },
  ];

  const isComplete = useCallback(
    (job: Partial<Jobs.ReqSubmitJob>) => {
      return jobRequiredFieldsComplete(job) && fileInputsComplete(app, job.fileInputs ?? []);
    },
    [ app ]
  )

  const defaultValues: Partial<Jobs.ReqSubmitJob> = generateDefaultValues(app);
  return (
    <Wizard<Jobs.ReqSubmitJob>
      steps={steps}
      defaultValues={defaultValues}
      memo={[app.id, app.version]}
      isComplete={isComplete}
    />
  );
};

export default React.memo(JobLauncherWizard);
