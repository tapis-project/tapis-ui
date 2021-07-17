import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSystems } from 'tapis-redux';
import { SystemList } from 'tapis-ui/components/systems';
import { FileListing } from 'tapis-ui/components/files';
import { TapisSystem } from '@tapis/tapis-typescript-systems';
import { SectionMessage, Icon } from 'tapis-ui/_common';
import { 
  ListSection, 
  ListSectionBody, 
  ListSectionDetail,
  ListSectionList,
  ListSectionHeader,
} from 'tapis-app/Sections/ListSection';
import { Config } from 'tapis-redux/types';
import { ListSectionGroup, ListSectionGroupItem, ListSectionGroupItemBody } from '../ListSection/ListSection';
import { default as ProjectSelect } from './Projects';
import { default as SiteSelect } from './Sites';
import { default as InstrumentSelect } from './Instruments';
import { default as Variables } from './Variables';
import { default as Measurements } from './Measurements';
// import { ProjectList, SiteList, InstrumentList, VariableList, MeasurementList } from 'tapis-ui/components/streams';
import { Streams } from "@tapis/tapis-typescript";


const [selectedProject, setSelectedProject] = useState<Streams.Project>(null);
const [selectedSite, setSelectedSite] = useState<Streams.Site>(null);
const [selectedInstrument, setSelectedInstrument] = useState<Streams.Instrument>(null);

const refreshProjects = () => {
    setSelectedProject(null);
    refreshSites
    //dispatch(list({}));
}
const refreshSites = () => {
    setSelectedSite(null);
    refreshInstruments()
    //dispatch(list({}));
}
const refreshInstruments = () => {
    setSelectedInstrument(null);
    //dispatch(list({}));
}

const projectSelectCallback = useCallback(
    (project: Streams.Project) => {
        console.log("Project selected", project);
        setSelectedProject(project);
        //clear selected site and instrument
        refreshSites();
    },
    [setSelectedProject]
);

const siteSelectCallback = useCallback(
    (site: Streams.Site) => {
        console.log("Site selected", site);
        setSelectedSite(site);
        //clear selected instrument
        refreshInstruments();
    },
    [setSelectedSite]
);

const instrumentSelectCallback = useCallback(
    (instrument: Streams.Instrument) => {
    console.log("Instrument selected", instrument);
        setSelectedInstrument(instrument);
    },
    [setSelectedInstrument]
);




/* remove config later... */
interface StreamsProps  {
    config?: Config
}

export const Projects: React.FC<StreamsProps> = ({config}) => {
    

    return (
        <ListSection>
            <ListSectionHeader>
                <div>
                    System List
                    &nbsp;
                    <span className="btn-head" onClick={refreshProjects}>
                        <Icon name="refresh" />
                    </span>
                </div>
            </ListSectionHeader>
            <ListSectionBody>
                <ProjectSelect config={config} onSelect={projectSelectCallback} selected={selectedProject} />
            </ListSectionBody>
        </ListSection>
    );
}

export const Sites: React.FC<StreamsProps> = ({config}) => {
    

    return (
        <ListSection>
            <ListSectionHeader>
                <div>
                    System List
                    &nbsp;
                    <span className="btn-head" onClick={refreshSites}>
                        <Icon name="refresh" />
                    </span>
                </div>
            </ListSectionHeader>
            <ListSectionBody>
                <SiteSelect project={selectedProject} config={config} onSelect={siteSelectCallback} selected={selectedSite} />
            </ListSectionBody>
        </ListSection>
    )
}

export const Instruments: React.FC<StreamsProps> = ({config}) => {
    

    return (
        <ListSection>
            <ListSectionHeader>
                <div>
                    System List
                    &nbsp;
                    <span className="btn-head" onClick={refreshInstruments}>
                        <Icon name="refresh" />
                    </span>
                </div>
            </ListSectionHeader>
            <ListSectionBody>
                <InstrumentSelect site={selectedSite} project={selectedProject} config={config} onSelect={instrumentSelectCallback} selected={selectedInstrument} />
            </ListSectionBody>
        </ListSection>
    )
}


