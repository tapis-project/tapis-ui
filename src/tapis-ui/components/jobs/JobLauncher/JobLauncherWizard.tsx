import React from 'react';
import { WizardStep } from 'tapis-ui/_wrappers/Wizard';
import { Wizard } from 'tapis-ui/_wrappers';
import * as Jobs from '@tapis/tapis-typescript-jobs';
import { JobStart, JobStartSummary } from './steps/JobStart';
import { FileInputs, FileInputsSummary } from './steps/FileInputs';
import { ExecSystem, ExecSystemSummary } from './steps/ExecSystem';
import * as Apps from '@tapis/tapis-typescript-apps';

type JobLauncherWizardProps = {
  app: Apps.TapisApp;
};

const JobLauncherWizard: React.FC<JobLauncherWizardProps> = ({ app }) => {
  const steps: Array<WizardStep> = [
    {
      id: 'start',
      name: `App Selection`,
      render: <JobStart app={app} />,
      summary: <JobStartSummary />,
    },
    {
      id: 'execSystem',
      name: 'Execution System',
      render: <ExecSystem app={app} />,
      summary: <ExecSystemSummary />
    },
    {
      id: 'fileInputs',
      name: 'File Stuff',
      render: <FileInputs app={app} />,
      summary: <FileInputsSummary />,
    }
  ];

  const defaultValues: Partial<Jobs.ReqSubmitJob> = {
    name: `${app.id}-${app.version}-${new Date().toISOString().slice(0, -5)}`,
    appId: app.id,
    appVersion: app.version,
    execSystemId: app.jobAttributes?.execSystemId
  };

  return (
    <Wizard<Jobs.ReqSubmitJob>
      steps={steps}
      defaultValues={defaultValues}
      memo={[app.id, app.version]}
    />
  );
};

export default React.memo(JobLauncherWizard);
