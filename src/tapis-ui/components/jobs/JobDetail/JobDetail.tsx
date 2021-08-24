import React from 'react';
import { useDetails } from 'tapis-hooks/jobs';
import { Jobs } from '@tapis/tapis-typescript';
import { Message, LoadingSpinner, DescriptionList } from 'tapis-ui/_common';

interface JobDetailProps {
  jobUuid: string,
}

const JobDetail: React.FC<JobDetailProps> = ({ jobUuid }) => {
  const { data, isLoading, error } = useDetails(jobUuid);

  if (isLoading) {
    return (
      <div>
        <LoadingSpinner placement="inline" /> Loading...
      </div>
    )
  }

  if (error) {
    return <Message canDismiss={false} type="error" scope="inline">{(error as any).message}</Message>
  }

  const job: Jobs.Job | undefined = data?.result;

  return (
    <div>     
      <h3>{job?.name}</h3>
      <h5>{job?.uuid}</h5>
      { job && <DescriptionList data={job} />}
    </div>
  );
};

export default JobDetail;
