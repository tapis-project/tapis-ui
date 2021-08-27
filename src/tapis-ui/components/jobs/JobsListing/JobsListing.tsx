import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useList } from 'tapis-hooks/jobs';
import { Jobs } from '@tapis/tapis-typescript';
import { LoadingSpinner, Message } from 'tapis-ui/_common';
import { Navbar, NavItem } from 'tapis-app/Navbar';

const JobsListing: React.FC = () => {
  const { data, isLoading, error } = useList();
  const { url } = useRouteMatch();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Message canDismiss={false} type="error" scope="inline">
        {(error as any).message}
      </Message>
    );
  }

  const jobsList: Array<Jobs.JobListDTO> = data?.result || [];

  return (
    <Navbar>
      {jobsList.length ? (
        jobsList.map((job: Jobs.JobListDTO | null) => {
          return (
            job && (
              <NavItem
                to={`${url}/${job.uuid}`}
                icon="jobs"
                key={job.uuid}
              >{`${job.name} - (${job.status})`}</NavItem>
            )
          );
        })
      ) : (
        <i>No jobs found</i>
      )}
    </Navbar>
  );
};

export default JobsListing;
