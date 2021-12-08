import React from 'react';
import { WizardStep } from 'tapis-ui/_common/Wizard';
import { Wizard } from 'tapis-ui/_common';

type JobLauncherWizardProps = {
  appId: string;
  appVersion: string;
  execSystemId: string;
  name: string;
}

const JobLauncherWizard: React.FC<JobLauncherWizardProps> = () => {
  const steps: Array<WizardStep> = [
    {
      id: 'step1',
      name: 'Job Stuff',
      render: <div>Job Stuff</div>
    },
    {
      id: 'step2',
      name: 'File Stuff',
      render: <div>File Stuff</div>
    }
  ];

  return (
    <Wizard steps={steps} />
  )
}

export default JobLauncherWizard;