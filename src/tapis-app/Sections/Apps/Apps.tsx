import React, { useState, useCallback } from 'react';
import { TapisApp } from '@tapis/tapis-typescript-apps';
import { AppsListing } from 'tapis-ui/components/apps';
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
  const [params, setParams] = useState<{
    appId: string,
    appVersion: string,
    name: string,
    execSystemId: string
  } | null>(null);

  const appSelectCallback = useCallback<(app: TapisApp) => any>(
    (app: TapisApp) => {
      const execSystemId = app?.jobAttributes?.execSystemId ?? '';
      setParams({
        appId: app.id ?? '',
        appVersion: app.version ?? '',
        name: `${app.id}-${app.version}-${new Date().toISOString().slice(0, -5)}`,
        execSystemId
      });
    },
    [ setParams ]
  )

  return (
    <ListSection>
      <ListSectionHeader>
      <div>
        Apps
      </div>
      </ListSectionHeader>
      <ListSectionBody>
        <ListSectionList>
          <AppsListing onSelect={appSelectCallback} />
        </ListSectionList>
        <ListSectionDetail>
          <ListSectionHeader type={"sub-header"}>Job Launcher</ListSectionHeader>
            {params
              ? <JobLauncher
                  appId={params.appId}
                  appVersion={params.appVersion}
                  name={params.name}
                  execSystemId={params.execSystemId}
                />
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
