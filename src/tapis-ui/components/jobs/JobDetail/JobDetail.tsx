import React from 'react';
import { useDetails } from 'tapis-hooks/jobs';
import { Jobs } from '@tapis/tapis-typescript';
import { DescriptionList } from 'tapis-ui/_common';
import { TapisUIComponent } from 'tapis-ui/components';

interface JobDetailProps {
  jobUuid: string,
}

const JobDetail: React.FC<JobDetailProps> = ({ jobUuid }) => {
  const { data, isLoading, error } = useDetails(jobUuid);
  const job: Jobs.Job | undefined = data?.result;
  return (
    <TapisUIComponent isLoading={isLoading} error={error}>
      <h3>{job?.name}</h3>
      <h5>{job?.uuid}</h5>
      { job && <DescriptionList data={job} />}
    </TapisUIComponent>
  )
};

export default JobDetail;
