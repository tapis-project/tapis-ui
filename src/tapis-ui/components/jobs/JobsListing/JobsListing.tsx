import React from 'react';
import { NavLink, useRouteMatch } from 'react-router-dom';
import { useList } from 'tapis-hooks/jobs';
import { Jobs } from '@tapis/tapis-typescript';
import { LoadingSpinner, Message, Icon } from 'tapis-ui/_common';
import './JobsListing.scss'

interface JobsListingItemProps {
  job: Jobs.JobListDTO,
}

const JobsListingItem: React.FC<JobsListingItemProps> = ({ job }) => {
  const { url } = useRouteMatch();
  return (
    <li className="nav-item">
    <NavLink to={`${url}/${job.uuid}`} className={"nav-link"} activeClassName={"active"}>
      <div className="nav-content">
        <Icon name="jobs" />
        <span className="nav-text">{`${job.name} - (${job.status})`}</span>
      </div>
    </NavLink>
  </li>
  );
};

interface JobsListingProps {
  className?: string,
}

const JobsListing: React.FC<JobsListingProps> = ({ className=null }) => {
  const { data, isLoading, error } = useList();

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <Message canDismiss={false} type="error" scope="inline">{(error as any).message}</Message>
  }

  const jobsList: Array<Jobs.JobListDTO> = data?.result || [];

  return (
    <div className={className ? className : "job-list nav flex-column"}>
      {
        jobsList.length
        ? jobsList.map((job: Jobs.JobListDTO | null) => {
            return job && (
              <JobsListingItem
                job={job}
                key={job.uuid}
              />
            )
          })
        : <i>No jobs found</i>
      }
    </div>
  );
};

export default JobsListing;
