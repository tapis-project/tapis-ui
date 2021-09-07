import React from 'react';
import { useDetails } from 'tapis-hooks/jobs';
import { Jobs } from '@tapis/tapis-typescript';
import { DescriptionList } from 'tapis-ui/_common';
import { QueryWrapper } from 'tapis-ui/_wrappers';

const JobDetail: React.FC<{ jobUuid: string }> = ({ jobUuid }) => {
  const { data, isLoading, error } = useDetails(jobUuid);
  const job: Jobs.Job | undefined = data?.result;

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <h3>{job?.name}</h3>
      <h5>{job?.uuid}</h5>
      {job && <DescriptionList data={job} />}
    </QueryWrapper>
  );
};

export default JobDetail;
