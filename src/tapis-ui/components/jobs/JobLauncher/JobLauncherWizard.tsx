import React from 'react';
import { WizardStep } from 'tapis-ui/_wrappers/Wizard';
import { Wizard } from 'tapis-ui/_wrappers';
import * as Jobs from '@tapis/tapis-typescript-jobs';
import { JobBasics, JobBasicsSummary } from './steps/JobBasics';

type JobLauncherWizardProps = {
  appId: string;
  appVersion: string;
};

const JobLauncherWizard: React.FC<JobLauncherWizardProps> = ({
  appId,
  appVersion,
}) => {
  const steps: Array<WizardStep> = [
    {
      id: 'step1',
      name: 'Job Stuff',
      render: (
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
      render: (<div>File Stuff</div>),
      summary: <div />
    },
  ];

  return (
    <Wizard<Jobs.ReqSubmitJob> steps={steps} />
  );
};

export default JobLauncherWizard;
