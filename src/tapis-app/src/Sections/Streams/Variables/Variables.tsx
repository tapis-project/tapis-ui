import React, { useState, useCallback } from 'react';
import { TapisApp } from '@tapis/tapis-typescript-apps';
import { OnSelectCallback } from 'tapis-ui/components/apps/AppsListing';
import { SectionHeader } from 'tapis-ui/_common';



const Variables: React.FC = () => {
  const [selectedApp, setSelectedApp] = useState<TapisApp>(null);
  const appSelectCallback = useCallback<OnSelectCallback>(
    (app: TapisApp) => {
      setSelectedApp(app);
    },
    [ setSelectedApp ]
  )

  return (
    <>
      <SectionHeader>Variable Select</SectionHeader>
      <div className="container">
        {
          selectedInstrument
            ? <VariableList projectId={selectedProject.project_name} siteId={selectedSite.site_id} instrumentId={selectedInstrument.inst_id} onSelect={variableSelectCallback} />
            : <div>No selected instrument</div>
        }
      </div>
    </>
  )
}

export default Variables;