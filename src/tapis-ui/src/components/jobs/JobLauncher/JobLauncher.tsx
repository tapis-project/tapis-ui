import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import JobForm, { OnChangeCallback } from 'tapis-ui/components/jobs/JobForm';
import JobSubmit, { OnSubmitCallback } from 'tapis-ui/components/jobs/JobSubmit';
import { Jobs } from '@tapis/tapis-typescript';
import { useJobs } from 'tapis-redux';

export interface JobLauncherProps {
  appId?: string,
  appVersion?: string,
  execSystemId?: string,
  onSubmit?: OnSubmitCallback
}

const JobLauncher: React.FC<JobLauncherProps> = ({ appId, appVersion, execSystemId, onSubmit }) => {
  const [ request, setRequest ] = useState<Jobs.ReqSubmitJob>({ appId, appVersion, execSystemId });
  const [ valid, setValid ] = useState<boolean>(false);
  const { resetSubmit } = useJobs();
  const dispatch = useDispatch();

  useEffect(
    () => {
      dispatch(resetSubmit());
    },
    []
  )

  const onChange = useCallback<OnChangeCallback>(
    (request: Jobs.ReqSubmitJob, valid: boolean) => {
      setValid(valid);
      if (valid) {
        setRequest(request);
      }
    },
    [ setRequest, setValid ]
  )

  return (
    <div>
      <JobForm
        appId={appId}
        appVersion={appVersion}
        execSystemId={execSystemId}
        onChange={onChange}
      ></JobForm>
      <JobSubmit request={request} disabled={!valid} onSubmit={onSubmit}/>
    </div>
  )
}

JobLauncher.defaultProps = {
  appId: null,
  appVersion: null,
  execSystemId: null,
  onSubmit: null
}

export default JobLauncher;