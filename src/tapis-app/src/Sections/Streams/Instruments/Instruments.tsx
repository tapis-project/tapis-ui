import React, { useState, useCallback } from 'react';
import { TapisApp } from '@tapis/tapis-typescript-apps';
import { InstrumentList } from "tapis-ui/components/streams";
import { OnSelectCallback } from 'tapis-ui/components/apps/AppsListing';
import { SectionHeader } from 'tapis-ui/_common';



const Instruments: React.FC = () => {
  const [selectedApp, setSelectedApp] = useState<TapisApp>(null);
  const appSelectCallback = useCallback<OnSelectCallback>(
    (app: TapisApp) => {
      setSelectedApp(app);
    },
    [ setSelectedApp ]
  )

  return (
    <>
      <SectionHeader>Instrument Select</SectionHeader>
      <div className="container">
        {
          selectedSite
            ? <InstrumentList projectId={selectedProject.project_name} siteId={selectedSite.site_id} onSelect={instrumentSelectCallback} selected={selectedInstrument} />
            : <div>No selected site</div>
        }
      </div>
    </>
    
  )
}

export default Instruments;