import React from 'react';
import { WizardStep } from 'tapis-ui/_wrappers/Wizard';
import { Wizard } from 'tapis-ui/_wrappers';
import * as Jobs from '@tapis/tapis-typescript-jobs';
import { JobBasics, JobBasicsSummary } from './steps/JobBasics';
import { FileInputs, FileInputsSummary } from './steps/FileInputs';
import * as Apps from '@tapis/tapis-typescript-apps';

type JobLauncherWizardProps = {
  app: Apps.TapisApp;
};

const JobLauncherWizard: React.FC<JobLauncherWizardProps> = ({ app }) => {
  const steps: Array<WizardStep> = [
    {
      id: 'step1',
      name: 'Job Stuff',
      render: <JobBasics appId={app.id} appVersion={app.version} />,
      summary: <JobBasicsSummary />,
    },

    {
      id: 'step2',
      name: 'File Stuff',
      render: <FileInputs app={app} />,
      summary: <FileInputsSummary />,
    },
  ];

  const defaultValues: Partial<Jobs.ReqSubmitJob> = {
    name: `${app.id}-${app.version}-${new Date().toISOString().slice(0, -5)}`,
    appId: app.id,
    appVersion: app.version,
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
