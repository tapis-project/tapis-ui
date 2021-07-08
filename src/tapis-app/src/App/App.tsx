import { hot } from 'react-hot-loader/root';
import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Route, useHistory } from 'react-router-dom';
import { Apps, Login } from 'tapis-app/Sections';
import { JobsListing } from 'tapis-ui/components/jobs';
import { FileListing } from 'tapis-ui/components/files';
import { SystemList } from 'tapis-ui/components/systems';
import { SectionHeader } from 'tapis-ui/_common';
import { LoginCallback } from 'tapis-redux/authenticator/types';
import { SystemsListCallback } from 'tapis-redux/systems/types';
import { TapisSystem } from '@tapis/tapis-typescript-systems';
import { useDispatch } from 'react-redux';
import { useApps, useSystems } from 'tapis-redux';
import Sidebar from '../Sidebar/Sidebar';
import UIPatterns from '../UIPatterns';
import Launcher from '../Launcher';
import Logout from '../Logout';
import './App.scss';

const App: React.FC = () => {
  const [selectedSystem, setSelectedSystem] = useState<TapisSystem>(null);

  const history = useHistory();


  const systemsListCallback = useCallback<SystemsListCallback>(
    (result) => {
      /* eslint-disable */
      console.log("Systems listing api result", result);
    },
    []
  )

  const systemSelectCallback = useCallback(
    (system: TapisSystem) => {
      /* eslint-disable */
      console.log("System selected", system);
      setSelectedSystem(system);
    },
    [setSelectedSystem]
  )

  return (
    <div className="workbench-wrapper">
      <Sidebar/>
      <div className="workbench-content">
        <Route exact path='/'>
          <SectionHeader>Dashboard</SectionHeader>
          <div className="container">[dashboard]</div>
        </Route>
        <Route path='/login'>
          <Login /> 
        </Route>
        <Route path='/logout'>
          <Logout />
        </Route>
        <Route path='/systems'>
          <SectionHeader>System Select</SectionHeader>
          <div className="container">
            <SystemList onList={systemsListCallback} onSelect={systemSelectCallback} />
          </div>
        </Route>
        <Route path='/files'>
          <SectionHeader>Files</SectionHeader>
          <div className="container">
            {
              // TODO: This should be a tapis-app file browser component that uses FileListing
              selectedSystem
                ? <FileListing systemId={selectedSystem.id} path={'/'} />
                : <div>No selected system</div>
            }
          </div>
        </Route>
        <Route path='/apps'>
          <Apps />
        </Route>
        <Route path='/jobs'>
        <SectionHeader>Jobs</SectionHeader>
          <div className="container">
            <JobsListing />
          </div>
        </Route>
        {/* <Route path='/launch/:appId/:appVersion'> */}
        <Route path='/launcher'>
          <SectionHeader>Job Launcher</SectionHeader>
          <div className="container">
            <Launcher />
          </div>
        </Route>
        <Route path='/uipatterns'>
          <SectionHeader>UI Patterns</SectionHeader>
          <UIPatterns />
        </Route>
      </div>
    </div>
  );
}

export default hot(App);
