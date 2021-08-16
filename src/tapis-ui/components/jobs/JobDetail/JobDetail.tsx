import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useJobs } from 'tapis-redux';
import { JobRetrieveCallback } from 'tapis-redux/jobs/retrieve/types';
import { Config } from 'tapis-redux/types';
import { Jobs } from '@tapis/tapis-typescript';
import { Message, LoadingSpinner, DescriptionList } from 'tapis-ui/_common';

export type OnRetrieveCallback = JobRetrieveCallback;

interface JobDetailProps {
  config?: Config,
  jobUuid: string,
  onRetrieve?: OnRetrieveCallback
}

const JobDetail: React.FC<JobDetailProps> = ({ config=undefined, jobUuid, onRetrieve=null }) => {
  const dispatch = useDispatch();

  const [job, setJob] = useState<Jobs.Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get a file listing given the systemId and path
  /* eslint-disable-next-line */
  const { jobs, retrieve } = useJobs(config);

  const jobRetrieveCallback = useCallback(
    (response: Jobs.RespGetJob) => {
      if (onRetrieve) {
        onRetrieve(response);
      }
      if (response.status !== "success") {
        setError(response.message || null);
      } else {
        setError(null);
        setJob(response.result || null);
      }
      setLoading(false);
    },
    [onRetrieve]
  )

  useEffect(() => {
    dispatch(retrieve({ request: { jobUuid }, onRetrieve: jobRetrieveCallback }));
  }, [onRetrieve, jobUuid, dispatch, retrieve, jobRetrieveCallback]);

  if (error) {
    return <Message canDismiss={false} type="error" scope="inline">{(error as any).message}</Message>
  }

  if (!job || loading) {
    return (
      <div>
        <LoadingSpinner placement="inline" /> Loading...
      </div>
    )
  }

  return (
    <div>     
      <h3>{job.name}</h3>
      <h5>{job.uuid}</h5>
      <DescriptionList data={job} />
    </div>
  );
};

export default JobDetail;
