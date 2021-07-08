import React, { useState, useCallback } from 'react';
import { JobListDTO } from '@tapis/tapis-typescript-jobs';
import { JobsListing } from 'tapis-ui/components/jobs';
import { JobDetail } from 'tapis-ui/components/jobs';
import { OnSelectCallback } from 'tapis-ui/components/jobs/JobsListing';
import { 
  ListSection, 
  ListSectionBody, 
  ListSectionDetail,
  ListSectionList,
  ListSectionHeader
} from 'tapis-app/Sections/ListSection';

const Jobs: React.FC = () => {
  const [job, setJob] = useState<JobListDTO>(null);
  const jobSelectCallback = useCallback<OnSelectCallback>(
    (job: JobListDTO) => {
      setJob(job);
    },
    [ setJob ]
  )

  return (
    <ListSection>
      <ListSectionHeader>Jobs</ListSectionHeader>
      <ListSectionBody>
        <ListSectionList>
          <JobsListing onSelect={jobSelectCallback} />
        </ListSectionList>
        <ListSectionDetail>
          <div>
            {job ? <JobDetail jobUuid={job.uuid} /> : "Select a job from the list"}
          </div>
        </ListSectionDetail>
      </ListSectionBody>
    </ListSection>
  )
}

export default Jobs;