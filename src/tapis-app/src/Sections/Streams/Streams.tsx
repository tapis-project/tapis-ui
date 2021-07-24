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
    const projects = useProjects(config);
    const sites = useSites(config);
    const instruments = useInstruments(config);

    let selectedProject = projects.state.selected;
    let selectedSite = sites.state.selected;
    
    const refreshProjects = () => {
        dispatch(projects.select(null));
        dispatch(sites.select(null));
        dispatch(instruments.select(null));
        dispatch(projects.list({}));
    }
    const refreshSites = () => {
        dispatch(sites.select(null));
        dispatch(instruments.select(null));
        if(selectedProject) {
            dispatch(sites.list({
                request: {
                    projectUuid: selectedProject.project_name
                }
            }));
        }
    }
    const refreshInstruments = () => {
        dispatch(instruments.select(null));
        if(selectedProject && selectedSite) {
            dispatch(instruments.list({
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
            dispatch(projects.select(project));
            //clear selected site and instrument
            dispatch(sites.select(null));
            dispatch(instruments.select(null));
        },
        [dispatch, projects, sites, instruments]
    );

    const siteSelectCallback = useCallback(
        (site: StreamsAPI.Site) => {
            console.log("Site selected", site);
            dispatch(sites.select(site));
            //clear selected instrument
            dispatch(instruments.select(null));
        },
        [dispatch, sites, instruments]
    );

    const instrumentSelectCallback = useCallback(
        (instrument: StreamsAPI.Instrument) => {
            console.log("Instrument selected", instrument);
            dispatch(instruments.select(instrument));
        },
        [dispatch, instruments]
    );


    return (
        <>
            <Route path='/streams/projects'>
                <Projects config={config} onSelect={projectSelectCallback} refresh={refreshProjects} />
            </Route>
            <Route path='/streams/sites'>
                <Sites project={selectedProject} config={config} onSelect={siteSelectCallback} refresh={refreshSites} />
            </Route>
            <Route path='/streams/instruments'>
                <Instruments project={selectedProject} site={selectedSite} config={config} onSelect={instrumentSelectCallback} refresh={refreshInstruments} />
            </Route>
        </>
        
    )
};


export default Streams;