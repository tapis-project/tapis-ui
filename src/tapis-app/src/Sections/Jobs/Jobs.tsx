import React, { useState, useCallback } from 'react';
import { JobListDTO } from '@tapis/tapis-typescript-jobs';
import { JobsListing } from 'tapis-ui/src/components/jobs';
import { useDispatch } from 'react-redux';
import { useJobs } from 'tapis-redux/src';
import { JobDetail } from 'tapis-ui/src/components/jobs';
import { SectionMessage, Icon } from 'tapis-ui/src/_common';
import { OnSelectCallback } from 'tapis-ui/src/components/jobs/JobsListing';
import { 
  ListSection, 
  ListSectionBody, 
  ListSectionDetail,
  ListSectionList,
  ListSectionHeader
} from 'tapis-app/src/Sections/ListSection';

const Jobs: React.FC = () => {
  const [job, setJob] = useState<JobListDTO | null>(null);
  const { list } = useJobs();
  const dispatch = useDispatch();
  const jobSelectCallback = useCallback<OnSelectCallback>(
    (job: JobListDTO) => {
      setJob(job);
    },
    [ setJob ]
  )
  const refresh = () => {
    setJob(null);
    dispatch(list({request: { orderBy: "created(desc)"}}));
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