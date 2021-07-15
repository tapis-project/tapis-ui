import React, { useState, useCallback } from 'react';
import { TapisApp } from '@tapis/tapis-typescript-apps';
import { OnSelectCallback } from 'tapis-ui/components/apps/AppsListing';
import { SectionHeader } from 'tapis-ui/_common';



const Sites: React.FC = () => {
  const [selectedApp, setSelectedApp] = useState<TapisApp>(null);
  const appSelectCallback = useCallback<OnSelectCallback>(
    (app: TapisApp) => {
      setSelectedApp(app);
    },
    [ setSelectedApp ]
  )

  return (
    <>
      <SectionHeader>Site Select</SectionHeader>
      <div className="container">
        {
          selectedProject
            ? <SiteList projectId={selectedProject.project_name} onSelect={siteSelectCallback} selected={selectedSite} />
            : <div>No selected project</div>
        }
      </div>
    </>
  )
}

export default Sites;