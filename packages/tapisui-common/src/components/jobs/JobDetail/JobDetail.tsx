import React from 'react';
import { Jobs as Hooks } from '@tapis/tapisui-hooks';
import { Jobs } from '@tapis/tapis-typescript';
import { DescriptionList, JSONDisplay } from '../../../ui';
import { QueryWrapper } from '../../../wrappers';

const createJobDisplay = (job: any) => {
  const keysToPrettyPrint = ['parameterSet', 'fileInputs'];
  const jobDisplay: { [key: string]: any } = {};

  for (const key in job) {
    if (keysToPrettyPrint.includes(key) && typeof job[key] === 'string') {
      try {
        jobDisplay[key] = JSON.parse(job[key]);
      } catch (e) {
        jobDisplay[key] = job[key];
      }
    } else {
      jobDisplay[key] = job[key];
    }
  }

  return jobDisplay;
};

const JobDetail: React.FC<{ jobUuid: string }> = ({ jobUuid }) => {
  const { data, isLoading, error } = Hooks.useDetails(jobUuid);
  const job: Jobs.Job | undefined = data?.result;

  const jobDisplay = job ? createJobDisplay(job) : undefined;

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <h3>{job?.name}</h3>
      <h6>{job?.uuid}</h6>
      {/* {job && <DescriptionList data={job} />} */}
      {jobDisplay && <JSONDisplay json={jobDisplay} />}
    </QueryWrapper>
  );
};

export default JobDetail;
