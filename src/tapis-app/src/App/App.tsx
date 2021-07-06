import { hot } from 'react-hot-loader/root';
import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Route, useHistory } from 'react-router-dom';
import { Login, Systems } from 'tapis-ui/components';
import { Apps } from 'tapis-app/Sections';
import { AppsListing } from 'tapis-ui/components/apps';
import { FileListing } from 'tapis-ui/components/files';
import { JobsListing } from 'tapis-ui/components/jobs';
import { LoginCallback } from 'tapis-redux/authenticator/types';
import { SystemsListCallback } from 'tapis-redux/systems/types';
import { OnSelectCallback as AppSelectCallback } from 'tapis-ui/components/apps/AppsListing';
import { TapisSystem } from '@tapis/tapis-typescript-systems';
import { TapisApp } from '@tapis/tapis-typescript-apps';
import Sidebar from '../Sidebar/Sidebar';
import UIPatterns from '../UIPatterns';
import Launcher from '../Launcher';
import './App.scss';

const App: React.FC = () => {
  // Demonstration of using some type of external state
  // management that isn't tapis-redux
  const [jwt, setJwt] = useState<string>(null);
  const [selectedSystem, setSelectedSystem] = useState<TapisSystem>(null);

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
      <Sidebar jwt={jwt}/>
      <div className="workbench-content">
        <Route exact path='/'>
          <div>Hello World!</div>
        </Route>
        <Route path='/login'>
          <Login config={config} onAuth={authCallback} />
        </Route>
        <Route path='/systems'>
          <Systems config={config} onList={systemsListCallback} onSelect={systemSelectCallback} />
        </Route>
        <Route path='/files'>
          {
            // TODO: This should be a tapis-app file browser component that uses FileListing
            selectedSystem
              ? <FileListing systemId={selectedSystem.id} path={'/'} />
              : <div>No selected system</div>
          }
        </Route>
        <Route path='/apps'>
          <Apps />
        </Route>
        <Route path='/jobs'>
          <JobsListing />
        </Route>
        <Route path='/launch/:appId/:appVersion'>
          <Launcher />
        </Route>
        <Route path='/uipatterns' component={UIPatterns} />
      </div>
    </div>
  );
}

export default hot(App);
