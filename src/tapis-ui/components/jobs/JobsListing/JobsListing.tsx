import React, { useState, useCallback } from 'react';
import { useList } from 'tapis-hooks/jobs';
import { Jobs } from '@tapis/tapis-typescript';
import { Icon } from 'tapis-ui/_common';
import { TapisUIComponent } from 'tapis-ui/components';
import './JobsListing.scss'

interface JobsListingItemProps {
  job: Jobs.JobListDTO,
  select: Function
  selected: boolean,
}

const JobsListingItem: React.FC<JobsListingItemProps> = ({ job, select, selected=false }) => {
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

interface JobsListingProps {
  onSelect?: (app: Jobs.JobListDTO) => any,
  className?: string
}

const JobsListing: React.FC<JobsListingProps> = ({ onSelect=null, className=null }) => {
  const { data, isLoading, error } = useList({ orderBy: "created(desc)" });

  const [currentJob, setCurrentJob] = useState<string>('');
  const select = useCallback<(job: Jobs.JobListDTO) => any>(
    (job: Jobs.JobListDTO) => {
      onSelect && onSelect(job);
      setCurrentJob(job.uuid ?? '')
  },
  [onSelect, setCurrentJob]);

  const jobsList: Array<Jobs.JobListDTO> = data?.result || [];

  return (
    <TapisUIComponent isLoading={isLoading} error={error} className={className ??  "job-list nav flex-column"}>
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
    </TapisUIComponent>
  )
};

export default JobsListing;
