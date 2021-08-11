import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useJobs } from 'tapis-redux/src';
import { JobsListCallback } from 'tapis-redux/src/jobs/list/types';
import { Config, TapisState } from 'tapis-redux/src/types';
import { Jobs } from '@tapis/tapis-typescript';
import { LoadingSpinner, Message, Icon } from 'tapis-ui/src/_common';
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

  const [currentJob, setCurrentJob] = useState<string>('');
  const select = useCallback<OnSelectCallback>(
    (job: Jobs.JobListDTO) => {
      onSelect && onSelect(job);
      setCurrentJob(job.uuid ?? '')
  },
  [onSelect, setCurrentJob]);

  if (!jobs || jobs.loading) {
    return <LoadingSpinner />
  }

  if (jobs.error) {
    return <Message canDismiss={false} type="error" scope="inline">{jobs.error.message}</Message>
  }

  const jobsList: Array<Jobs.JobListDTO | null> = jobs.results;

  return (
    <div className={className ? className : "job-list nav flex-column"}>
      {
        jobsList.length
        ? jobsList.map((job: Jobs.JobListDTO | null) => {
            return job && (
              <JobsListingItem
                job={job}
                select={select}
                selected={currentJob === job.uuid}
                key={job.uuid}
              />
            )
          })
        : <i>No jobs found</i>
      }
    </div>
  );
};

JobsListing.defaultProps = {
  config: undefined,
  onList: null,
  onSelect: undefined
}

export default JobsListing;
