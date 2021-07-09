import React from 'react';
import { JobLauncher } from 'tapis-ui/components/jobs';
import { Jobs } from '@tapis/tapis-typescript';

interface LauncherProps {
  initialValues: Jobs.ReqSubmitJob
}

const Launcher: React.FC<LauncherProps> = ({initialValues}) => {
  return (
    <div>
      <JobLauncher initialValues={initialValues} />
    </div>
  )
}

export default Launcher;