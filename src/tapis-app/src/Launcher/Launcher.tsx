import React from 'react';
import { useParams } from 'react-router-dom'
import { JobLauncher } from 'tapis-ui/components/jobs';
import { Jobs } from '@tapis/tapis-typescript';

const Launcher: React.FC = () => {
  //const { appId, appVersion } = useParams();
  const appId = "SleepSeconds";
  const appVersion = "0.0.1";
  const initialValues: Jobs.ReqSubmitJob = {
    appId,
    appVersion,
    name: `${appId}-${appVersion}-${new Date().toISOString().slice(0, -5)}`,
    execSystemId: 'tapisv3-exec'
  }
  return (
    <div>
      <JobLauncher initialValues={initialValues} />
    </div>
  )
}

export default Launcher;