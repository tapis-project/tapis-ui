import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useJobs } from 'tapis-redux';
import { JobsListCallback } from 'tapis-redux/jobs/list/types';
import { Config, TapisState } from 'tapis-redux/types';
import { Jobs } from '@tapis/tapis-typescript';
import { LoadingSpinner, Message, Icon } from 'tapis-ui/_common';
import './JobsListing.scss'

export type OnSelectCallback = (app: Jobs.JobListDTO) => any;

interface JobsListingItemProps {
  job: Jobs.JobListDTO,
  select: Function
  selected: boolean,
}

const JobsListingItem: React.FC<JobsListingItemProps> = ({ job, select, selected }) => {
  return (
    <li className="nav-item">
    <div className={"nav-link" + (selected ? ' active' : '')}>
      <div className="nav-content" onClick={() => select(job) }>
        <Icon name="jobs" />
        <span className="nav-text">{`${job.name} - (${job.status})`}</span>
      </div>
    </div>
  </li>
  );
};

JobsListingItem.defaultProps = {
  selected: false
}

interface JobsListingProps {
  config?: Config,
  onList?: JobsListCallback,
  onSelect?: OnSelectCallback,
  className?: string
}

const JobsListing: React.FC<JobsListingProps> = ({ config, onList, onSelect, className }) => {
  const dispatch = useDispatch();

  // Get a file listing given the systemId and path
  const { list, jobs } = useJobs(config);
  useEffect(() => {
    dispatch(list({ onList, request: { orderBy: "created(desc)"} }));
  }, [dispatch, onList]);

  const jobSelectCallback = useCallback<OnSelectCallback>(
    (job: Jobs.JobListDTO) => {
      if (onSelect) {
        onSelect(job);
      }
    },
    [onSelect]
  )

  const [currentJob, setCurrentJob] = useState(String);
  const select = useCallback<OnSelectCallback>(
    (job: Jobs.JobListDTO) => {
      onSelect(job);
      setCurrentJob(job.uuid)
  },
  [onSelect, setCurrentJob]);

  if (!jobs || jobs.loading) {
    return <LoadingSpinner />
  }

  if (jobs.error) {
    return <Message canDismiss={false} type="error" scope="inline">{jobs.error.message}</Message>
  }

  const jobsList: Array<Jobs.JobListDTO> = jobs.results;

  return (
    <div className={className ? className : "job-list nav flex-column"}>
      {
        jobsList.map((job: Jobs.JobListDTO) => {
          return (
            <JobsListingItem
              job={job}
              select={select}
              selected={currentJob === job.uuid}
              key={job.uuid}
            />
          )
        })
      }
    </div>
  );
};

JobsListing.defaultProps = {
  config: null,
  onList: null,
  onSelect: null
}

export default JobsListing;
