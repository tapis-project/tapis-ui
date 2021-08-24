import React, { useState, useCallback } from 'react';
import { useList } from 'tapis-hooks/jobs';
import { JobListDTO } from '@tapis/tapis-typescript-jobs';
import { JobsListing } from 'tapis-ui/components/jobs';
import { JobDetail } from 'tapis-ui/components/jobs';
import { SectionMessage, Icon } from 'tapis-ui/_common';
import { 
  ListSection, 
  ListSectionBody, 
  ListSectionDetail,
  ListSectionList,
  ListSectionHeader
} from 'tapis-app/Sections/ListSection';

const Jobs: React.FC = () => {
  const { refetch } = useList();
  const [job, setJob] = useState<JobListDTO | null>(null);
  const jobSelectCallback = useCallback<(job: JobListDTO) => any>(
    (job: JobListDTO) => {
      setJob(job);
    },
    [ setJob ]
  )
  const refresh = () => {
    setJob(null);
    refetch();
  }

  return (
    <ListSection>
      <ListSectionHeader>
      <div>
        Jobs
        &nbsp;
        <span className="btn-head" onClick={refresh}>
            <Icon name="refresh" />
        </span>
      </div>
      </ListSectionHeader>
      <ListSectionBody>
        <ListSectionList>
          <JobsListing onSelect={jobSelectCallback} />
        </ListSectionList>
        <ListSectionDetail>
          <ListSectionHeader type={"sub-header"}>Job Details</ListSectionHeader>
          {job
            ? <JobDetail jobUuid={job.uuid ?? ''} />
            : <SectionMessage type="info">
                Select a job from the list.
              </SectionMessage>
          }
        </ListSectionDetail>
      </ListSectionBody>
    </ListSection>
  )
}

export default Jobs;