import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useList } from 'tapis-hooks/jobs';
import { Jobs } from '@tapis/tapis-typescript';
import { Navbar, NavItem } from 'tapis-ui/_wrappers/Navbar';
import { QueryWrapper } from 'tapis-ui/_wrappers';

const JobsNav: React.FC = () => {
  const { data, isLoading, error } = useList();
  const { url } = useRouteMatch();
  const jobsList: Array<Jobs.JobListDTO> = data?.result ?? [];

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <Navbar>
        {jobsList.length ? (
          jobsList.map((job: Jobs.JobListDTO) => (
            <NavItem to={`${url}/${job.uuid}`} icon="jobs" key={job.uuid}>
              {`${job.name} - (${job.status})`}
            </NavItem>
          ))
        ) : (
          <i>No jobs found</i>
        )}
      </Navbar>
    </QueryWrapper>
  );
};

export default JobsNav;
