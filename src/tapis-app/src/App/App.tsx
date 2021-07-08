import { hot } from 'react-hot-loader/root';
import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Route, useHistory } from 'react-router-dom';
import { Apps, Login, Dashboard, Jobs } from 'tapis-app/Sections';
import { FileListing } from 'tapis-ui/components/files';
import { SystemList } from 'tapis-ui/components/systems';
import { SectionHeader } from 'tapis-ui/_common';
import { SystemsListCallback } from 'tapis-redux/systems/types';
import { TapisSystem } from '@tapis/tapis-typescript-systems';
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
          <Dashboard />
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
          <Jobs />
        </Route>
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
