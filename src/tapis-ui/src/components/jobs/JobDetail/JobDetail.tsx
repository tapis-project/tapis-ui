import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useJobs } from 'tapis-redux';
import { JobRetrieveCallback } from 'tapis-redux/jobs/retrieve/types';
import { Config, TapisState } from 'tapis-redux/types';
import { Jobs } from '@tapis/tapis-typescript';
import { LoadingSpinner } from 'tapis-ui/_common';

export type OnRetrieveCallback = JobRetrieveCallback;

interface JobDetailProps {
  config?: Config,
  jobUuid: string,
  onRetrieve?: OnRetrieveCallback
}

const JobDetail: React.FC<JobDetailProps> = ({ config, jobUuid, onRetrieve }) => {
  const dispatch = useDispatch();

  const [job, setJob] = useState<Jobs.Job>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get a file listing given the systemId and path
  const { jobs, retrieve } = useJobs(config);

  const jobRetrieveCallback = useCallback<JobRetrieveCallback>(
    (response: Jobs.RespGetJob) => {
      if (onRetrieve) {
        onRetrieve(response);
      }
      if (response.status !== "success") {
        setError(response.message);
      } else {
        setError(null);
        setJob(response.result);
      }
      setLoading(false);
    },
    [onRetrieve]
  )

  useEffect(() => {
    dispatch(retrieve({ request: { jobUuid }, onRetrieve: jobRetrieveCallback }));
  }, [onRetrieve]);


  if (!job) {
    return (
      <div>
        <LoadingSpinner placement="inline" /> Loading...
      </div>
    )
  }

  const jobsList: Array<Jobs.JobListDTO> = jobs.results;

  return (
    <div>
      {
        job.name
      }
    </div>
  );
};

JobDetail.defaultProps = {
  config: null,
  onRetrieve: null
}

export default JobDetail;
