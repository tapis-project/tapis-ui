import React, { useState, useCallback } from 'react';
import { TapisApp } from '@tapis/tapis-typescript-apps';
import { Jobs } from '@tapis/tapis-typescript';
import { AppsListing } from 'tapis-ui/components/apps';
import { OnSelectCallback } from 'tapis-ui/components/apps/AppsListing';
import JobLauncher from 'tapis-ui/components/jobs/JobLauncher';
import { SectionMessage } from 'tapis-ui/_common';
import { 
  ListSection, 
  ListSectionBody, 
  ListSectionDetail,
  ListSectionList,
  ListSectionHeader
} from 'tapis-app/Sections/ListSection';
import { useJobs } from 'tapis-redux';
import { useDispatch } from 'react-redux';

const Apps: React.FC = () => {
  const { resetSubmit } = useJobs();
  const dispatch = useDispatch();
  const [initialValues, setInitialValues] = useState<Jobs.ReqSubmitJob>(null);
  const appSelectCallback = useCallback<OnSelectCallback>(
    (app: TapisApp) => {
      dispatch(resetSubmit());
      const execSystemId = app.jobAttributes && 
        app.jobAttributes.execSystemId ? app.jobAttributes.execSystemId : null;
      setInitialValues({
        appId: app.id,
        appVersion: app.version,
        name: `${app.id}-${app.version}-${new Date().toISOString().slice(0, -5)}`,
        execSystemId
      });
    },
    [ setInitialValues, dispatch, resetSubmit ]
  )

  return (
    <ListSection>
      <ListSectionHeader>Apps</ListSectionHeader>
      <ListSectionBody>
        <ListSectionList>
          <AppsListing onSelect={appSelectCallback} select="jobAttributes,version" />
        </ListSectionList>
        <ListSectionDetail>
          <ListSectionHeader type={"sub-header"}>Job Launcher</ListSectionHeader>
            {initialValues
              ? <JobLauncher initialValues={initialValues}/>
              : <SectionMessage type="info">
                  Select an app from the list.
                </SectionMessage>
            }
        </ListSectionDetail>
      </ListSectionBody>
    </ListSection>
  )
}

export default Apps;
