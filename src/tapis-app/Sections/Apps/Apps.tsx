import React, { useState, useCallback } from 'react';
import { TapisApp } from '@tapis/tapis-typescript-apps';
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
import { useList } from 'tapis-hooks/apps';

const Apps: React.FC = () => {
  const [params, setParams] = useState<{
    appId: string,
    appVersion: string,
    name: string,
    execSystemId: string
  } | null>(null);
  const { refetch } = useList({ select: "jobAttributes,version" });

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
  const refresh = () => {
    setParams(null);
    refetch();
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
