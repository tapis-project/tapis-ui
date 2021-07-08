import React, { useState, useCallback } from 'react';
import { JobListDTO } from '@tapis/tapis-typescript-jobs';
import { JobsListing } from 'tapis-ui/components/jobs';
import { OnSelectCallback } from 'tapis-ui/components/jobs/JobsListing';
import { 
  ListSection, 
  ListSectionBody, 
  ListSectionDetail,
  ListSectionList,
  ListSectionHeader
} from 'tapis-app/Sections/ListSection';

const Jobs: React.FC = () => {
  const [selectedJob, setSelectedJob] = useState<JobListDTO>(null);
  const jobSelectCallback = useCallback<OnSelectCallback>(
    (job: JobListDTO) => {
      setSelectedJob(job);
    },
    [ setSelectedJob ]
  )

  return (
    <ListSection>
      <ListSectionHeader>Apps</ListSectionHeader>
      <ListSectionBody>
        <ListSectionList>
          <JobsListing />
        </ListSectionList>
        <ListSectionDetail>
          <div>
            {selectedJob ? selectedJob.name : "Select a job from the list"}
          </div>
        </ListSectionDetail>
      </ListSectionBody>
    </ListSection>
  )
}

export default Jobs;