import React from 'react';
import { useParams } from 'react-router-dom'
import { JobLauncher } from 'tapis-ui/components/jobs';
import { Jobs } from '@tapis/tapis-typescript';

interface LauncherProps {
  initialValues: Jobs.ReqSubmitJob
}

const Launcher: React.FC<LauncherProps> = ({initialValues}) => {
  //const { appId, appVersion } = useParams();
  return (
    <div>
      <JobLauncher initialValues={initialValues} />
    </div>
  )
}

export default Launcher;