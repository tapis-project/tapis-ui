import { hot } from 'react-hot-loader/root';
import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Route, useHistory } from 'react-router-dom';
import { Login } from 'tapis-ui/components';
import { Apps } from 'tapis-app/Sections';
import { AppsListing } from 'tapis-ui/components/apps';
import { JobsListing } from 'tapis-ui/components/jobs';
import { FileListing } from 'tapis-ui/components/files';
import { SystemList } from 'tapis-ui/components/systems';
import { SectionHeader } from 'tapis-ui/_common';
import { LoginCallback } from 'tapis-redux/authenticator/types';
import { SystemsListCallback } from 'tapis-redux/systems/types';
import { OnSelectCallback as AppSelectCallback } from 'tapis-ui/components/apps/AppsListing';
import { TapisSystem } from '@tapis/tapis-typescript-systems';
import { TapisApp } from '@tapis/tapis-typescript-apps';
import { useDispatch } from 'react-redux';
import { useApps, useSystems } from 'tapis-redux';
import Sidebar from '../Sidebar/Sidebar';
import UIPatterns from '../UIPatterns';
import Launcher from '../Launcher';
import './App.scss';

const App: React.FC = () => {
  // Demonstration of using some type of external state
  // management that isn't tapis-redux
  const [jwt, setJwt] = useState<string>(null);
  const [selectedSystem, setSelectedSystem] = useState<TapisSystem>(null);
  const dispatch = useDispatch();
  const listApps = useApps().list;
  const listSystems = useSystems().list;

  const history = useHistory();
  
  const authCallback = useCallback<LoginCallback>(
    (result) => {
      /* eslint-disable */
      console.log("Authentication api result", result);
      // Handle errors during login
      if (result instanceof Error) {
        return;
      }
      // Set local view state
      setJwt(result.access_token);
      // Can make also make an external call to propagate the login result
      dispatch(listApps({}));
      dispatch(listSystems({}));
    },
    [setJwt]
  );

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

  // Demonstration of config to use alternate URLs or provided tokens
  const config = {
    jwt,
    tenant: 'https://dev.develop.tapis.io',
  };

  return (
    <div className="workbench-wrapper">
      <Sidebar jwt={jwt} selectedSystem={selectedSystem}/>
      <div className="workbench-content">
        <Route exact path='/'>
          <SectionHeader>Dashboard</SectionHeader>
          <div className="container">[dashboard]</div>
        </Route>
        <Route path='/login'>
          <SectionHeader>Login</SectionHeader>
          <div className="container">
            <Login config={config} onAuth={authCallback} />
          </div>
        </Route>
        <Route path='/systems'>
          <SectionHeader>System Select</SectionHeader>
          <div className="container">
            <SystemList config={config} onList={systemsListCallback} onSelect={systemSelectCallback} />
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
        <Route path='/launch/:appId/:appVersion'>
          <SectionHeader>Launcher</SectionHeader>
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
