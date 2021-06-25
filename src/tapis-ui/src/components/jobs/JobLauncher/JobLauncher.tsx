import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import JobForm, { OnChangeCallback } from 'tapis-ui/components/jobs/JobForm';
import JobSubmit, { OnSubmitCallback } from 'tapis-ui/components/jobs/JobSubmit';
import { Jobs } from '@tapis/tapis-typescript';
import { useJobs } from 'tapis-redux';
import { Config } from 'tapis-redux/types';

export interface JobLauncherProps {
  request: Jobs.ReqSubmitJob,
  onSubmit?: OnSubmitCallback,
  config?: Config
}

const JobLauncher: React.FC<JobLauncherProps> = ({ request, onSubmit, config }) => {
  const [ requestState, setRequestState ] = useState<Jobs.ReqSubmitJob>({ ...request });
  const [ valid, setValid ] = useState<boolean>(false);
  const { submission, resetSubmit } = useJobs();
  const dispatch = useDispatch();

  useEffect(
    () => {
      dispatch(resetSubmit());
    },
    []
  )

  // If request changes in JobForm, reflect it here so that
  // the new request state can be passed to JobSubmit
  const onChange = useCallback<OnChangeCallback>(
    (changedRequest: Jobs.ReqSubmitJob, valid: boolean) => {
      setValid(valid);
      if (valid) {
        setRequestState(changedRequest);
      }
    },
    [ setRequestState, setValid ]
  )
  
  const now = new Date().toISOString().slice(0, -5);

  console.log(submission);

  return (
    <div>
      <JobForm
        config={config}
        onChange={onChange}
        request={requestState}
      ></JobForm>
      <JobSubmit request={request} disabled={!valid} onSubmit={onSubmit} config={config}/>
      <div>
        {
          submission.error && <div>{submission.error.message}</div>
        }
        {
          submission.result && <div>{submission.result.name} submitted with UUID {submission.result.uuid}</div>
        }
      </div>
    </div>
  )
}

JobLauncher.defaultProps = {
  request: null,
  onSubmit: null,
  config: null
}

export default JobLauncher;