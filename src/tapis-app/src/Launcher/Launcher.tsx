import React from 'react';
import { useParams } from 'react-router-dom'
import { JobLauncher } from 'tapis-ui/components/jobs';

const Launcher: React.FC = () => {
  const { appId, appVersion } = useParams();
  return (
    <div>
      <JobLauncher appId={appId} appVersion={appVersion} />
    </div>
  )
}

export default Launcher;