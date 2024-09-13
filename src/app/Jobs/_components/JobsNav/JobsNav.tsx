import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import { Jobs as Hooks } from '@tapis/tapisui-hooks';
import { Jobs } from '@tapis/tapis-typescript';
import { Navbar, NavItem } from '@tapis/tapisui-common';
import { QueryWrapper } from '@tapis/tapisui-common';

const JobsNav: React.FC = () => {
  const { data, isLoading, error } = Hooks.useList();
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
          <i style={{ padding: '16px' }}>No jobs found</i>
        )}
      </Navbar>
    </QueryWrapper>
  );
};

export default JobsNav;
