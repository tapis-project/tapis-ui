import React from 'react';
import { useParams } from 'react-router-dom'
import { JobLauncher } from 'tapis-ui/components/jobs';
import { OnSubmitCallback } from 'tapis-ui/components/jobs/JobSubmit';
import { Jobs } from '@tapis/tapis-typescript';

const Launcher: React.FC = () => {
  const { appId, appVersion } = useParams();
  const onSubmit: OnSubmitCallback = (job: Jobs.Job) => {
    console.log("Job submission complete", job);
  }
  return (
    <div>
      <JobLauncher appId={appId} appVersion={appVersion} onSubmit={onSubmit}/>
    </div>
  )
}

export default Launcher;