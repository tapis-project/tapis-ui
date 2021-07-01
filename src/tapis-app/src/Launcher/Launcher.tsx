import React from 'react';
import { useParams } from 'react-router-dom'
import { JobLauncher } from 'tapis-ui/components/jobs';
import { Jobs } from '@tapis/tapis-typescript';

const Launcher: React.FC = () => {
  const { appId, appVersion } = useParams();
  const request: Jobs.ReqSubmitJob = {
    appId,
    appVersion,
    name: `${appId}-${appVersion}-${new Date().toISOString().slice(0, -5)}`,
    execSystemId: 'tapisv3-exec'
  }
  return (
    <div>
      <JobLauncher request={request} />
    </div>
  )
}

export default Launcher;