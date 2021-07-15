import React, { useState, useCallback } from 'react';
import { TapisApp } from '@tapis/tapis-typescript-apps';
import { OnSelectCallback } from 'tapis-ui/components/apps/AppsListing';
import { SectionHeader } from 'tapis-ui/_common';

const Projects: React.FC = () => {
  const [selectedApp, setSelectedApp] = useState<TapisApp>(null);
  const appSelectCallback = useCallback<OnSelectCallback>(
    (app: TapisApp) => {
      setSelectedApp(app);
    },
    [ setSelectedApp ]
  )

  return (
    <>
      <SectionHeader>Project Select</SectionHeader>
      <div className="container">
        <ProjectList config={config} onSelect={projectSelectCallback} selected={selectedProject} />
      </div>
    </>
  )
}


export default Projects;