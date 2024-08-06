import React from 'react';
import { Jobs as Hooks } from '@tapis/tapisui-hooks';
import { Jobs } from '@tapis/tapis-typescript';
import { DescriptionList } from '../../../ui';
import { QueryWrapper } from '../../../wrappers';

const JobDetail: React.FC<{ jobUuid: string }> = ({ jobUuid }) => {
  const { data, isLoading, error } = Hooks.useDetails(jobUuid);
  const job: Jobs.Job | undefined = data?.result;

  // console.log(job?.execSystemOutputDir);

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <h3>{job?.name}</h3>
      <h5>{job?.uuid}</h5>
      {job && <DescriptionList data={job} />}
    </QueryWrapper>
  );
};

export default JobDetail;
