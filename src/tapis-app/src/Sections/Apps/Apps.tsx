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

const Apps: React.FC = () => {
  const [initialValues, setInitialValues] = useState<Jobs.ReqSubmitJob>(null);
  const appSelectCallback = useCallback<OnSelectCallback>(
    (app: TapisApp) => {
      console.log(app);
      setInitialValues({
        appId: app.id,
        appVersion: app.version,
        name: `${app.id}-${app.version}-${new Date().toISOString().slice(0, -5)}`,
        execSystemId: 'tapisv3-exec'
      })
    },
    [ setInitialValues ]
  )

  return (
    <ListSection>
      <ListSectionHeader>Apps</ListSectionHeader>
      <ListSectionBody>
        <ListSectionList>
          <AppsListing onSelect={appSelectCallback} />
        </ListSectionList>
        <ListSectionDetail>
          <ListSectionHeader type={"sub-header"}>Launcher</ListSectionHeader>
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