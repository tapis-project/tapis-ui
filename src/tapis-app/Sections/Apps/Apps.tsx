import React, { useState, useCallback } from 'react';
import { TapisApp } from '@tapis/tapis-typescript-apps';
import { Jobs } from '@tapis/tapis-typescript';
import { AppsListing } from 'tapis-ui/components/apps';
import JobLauncher from 'tapis-ui/components/jobs/JobLauncher';
import { SectionMessage, Icon } from 'tapis-ui/_common';
import { 
  ListSection, 
  ListSectionBody, 
  ListSectionDetail,
  ListSectionList,
  ListSectionHeader
} from 'tapis-app/Sections/ListSection';

const Apps: React.FC = () => {
  const [initialValues, setInitialValues] = useState<Jobs.ReqSubmitJob | null>(null);
  const appSelectCallback = useCallback<(app: TapisApp) => any>(
    (app: TapisApp) => {
      const execSystemId = app.jobAttributes && 
        app.jobAttributes.execSystemId ? app.jobAttributes.execSystemId : null;
      setInitialValues({
        appId: app.id,
        appVersion: app.version,
        name: `${app.id}-${app.version}-${new Date().toISOString().slice(0, -5)}`,
        execSystemId: execSystemId ?? undefined
      });
    },
    [ setInitialValues ]
  )
  const refresh = () => {
    setInitialValues(null);
  }

  return (
    <ListSection>
      <ListSectionHeader>
      <div>
        Apps
        &nbsp;
        <span className="btn-head" onClick={refresh}>
            <Icon name="refresh" />
        </span>
      </div>
      </ListSectionHeader>
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
