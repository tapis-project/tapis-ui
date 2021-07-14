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

{/* <Route path='/streams/projects'>
          <SectionHeader>Project Select</SectionHeader>
          <div className="container">
            <ProjectList config={config} onSelect={projectSelectCallback} selected={selectedProject} />
          </div>
        </Route>
        <Route path='/streams/sites'>
          <SectionHeader>Site Select</SectionHeader>
          <div className="container">
            {
              selectedProject
                ? <SiteList projectId={selectedProject.project_name} onSelect={siteSelectCallback} selected={selectedSite} />
                : <div>No selected project</div>
            }
          </div>
        </Route>
        <Route path='/streams/instruments'>
          
        </Route>
        <Route path='/streams/variables'>
          <SectionHeader>Variable Select</SectionHeader>
          <div className="container">
            {
              selectedInstrument
                ? <VariableList projectId={selectedProject.project_name} siteId={selectedSite.site_id} instrumentId={selectedInstrument.inst_id} onSelect={variableSelectCallback} />
                : <div>No selected instrument</div>
            }
          </div>
        </Route>
        <Route path='/streams/measurements'>
          <SectionHeader>Measurements</SectionHeader>
          <div className="container">
            {
              selectedInstrument
                ? <MeasurementList projectId={selectedProject.project_name} siteId={selectedSite.site_id} instrumentId={selectedInstrument.inst_id} onSelect={measurementSelectCallback} />
                : <div>No selected instrument</div>
            }
          </div>
        </Route> */}

export default Instruments;