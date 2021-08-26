import React, { useState, useCallback } from 'react';
import { useList } from 'tapis-hooks/jobs';
import { Jobs } from '@tapis/tapis-typescript';
import { Icon } from 'tapis-ui/_common';
import { TapisUIList, TapisUIListItem } from 'tapis-ui/components';
import './JobsListing.scss'

interface JobsListingProps {
  onSelect?: (app: Jobs.JobListDTO) => any,
  className?: string
}

const JobsListing: React.FC<JobsListingProps> = ({ onSelect=null, className=null }) => {
  const { data, isLoading, error } = useList({ orderBy: "created(desc)" });
  const jobsList: Array<Jobs.JobListDTO> = data?.result || [];

  return (
    <TapisUIList isLoading={isLoading} error={error}>
      {
        jobsList.map(
          (job) => {
            return (
              <TapisUIListItem data={job} icon="jobs">
                {`${job.name} - (${job.status})`}
              </TapisUIListItem>
            )
          }
        )
      }
    </TapisUIList>
  )
};

export default JobsListing;
