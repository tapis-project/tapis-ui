import React, { useState, useCallback } from 'react';
import { Config } from 'tapis-redux/types';
import { Streams as StreamsAPI } from "@tapis/tapis-typescript";
import { Route } from 'react-router-dom';
import { default as Projects } from "./Projects";
import { default as Sites } from "./Sites";
import { default as Instruments } from "./Instruments";
import { useDispatch } from 'react-redux';
import { useInstruments, useProjects, useSites } from 'tapis-redux';



/* remove config later... */
interface StreamsProps  {
    config?: Config
}


export const Streams: React.FC<StreamsProps> = ({config}) => {

    const dispatch = useDispatch();
    const listProjects = useProjects().list;
    const listSites = useSites().list;
    const listInstruments = useInstruments().list;

    const [selectedProject, setSelectedProject] = useState<StreamsAPI.Project>(null);
    const [selectedSite, setSelectedSite] = useState<StreamsAPI.Site>(null);
    const [selectedInstrument, setSelectedInstrument] = useState<StreamsAPI.Instrument>(null);

    const refreshProjects = () => {
        setSelectedProject(null);
        setSelectedSite(null);
        setSelectedInstrument(null);
        dispatch(listProjects({}));
    }
    const refreshSites = () => {
        setSelectedSite(null);
        setSelectedInstrument(null);
        if(selectedProject) {
            dispatch(listSites({
                request: {
                    projectUuid: selectedProject.project_name
                }
            }));
        }
    }
    const refreshInstruments = () => {
        setSelectedInstrument(null);
        if(selectedProject && selectedSite) {
            dispatch(listInstruments({
                request: {
                    projectUuid: selectedProject.project_name,
                    siteId: selectedSite.site_id
                }
            }));
        }
    }

    const projectSelectCallback = useCallback(
        (project: StreamsAPI.Project) => {
            console.log("Project selected", project);
            setSelectedProject(project);
            //clear selected site and instrument
            setSelectedSite(null);
            setSelectedInstrument(null);
        },
        [setSelectedProject]
    );

    const siteSelectCallback = useCallback(
        (site: StreamsAPI.Site) => {
            console.log("Site selected", site);
            setSelectedSite(site);
            //clear selected instrument
            setSelectedInstrument(null);
        },
        [setSelectedSite]
    );

    const instrumentSelectCallback = useCallback(
        (instrument: StreamsAPI.Instrument) => {
        console.log("Instrument selected", instrument);
            setSelectedInstrument(instrument);
        },
        [setSelectedInstrument]
    );


    return (
        <>
            <Route path='/streams/projects'>
                <Projects config={config} onSelect={projectSelectCallback} selected={selectedProject} refresh={refreshProjects} />
            </Route>
            <Route path='/streams/sites'>
                <Sites project={selectedProject} config={config} onSelect={siteSelectCallback} selected={selectedSite} refresh={refreshSites} />
            </Route>
            <Route path='/streams/instruments'>
                <Instruments project={selectedProject} site={selectedSite} config={config} onSelect={instrumentSelectCallback} selected={selectedInstrument} refresh={refreshInstruments} />
            </Route>
        </>
        
    )
};


export default Streams;