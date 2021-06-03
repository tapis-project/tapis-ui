import { hot } from 'react-hot-loader/root';
import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Login, Systems } from 'tapis-ui/components';
import { LoginCallback } from 'tapis-redux/authenticator/types';
import { SystemsListCallback } from 'tapis-redux/systems/types';
import Sidebar from '../Sidebar/Sidebar';
import UIPatterns from '../UIPatterns';
import './App.scss';

const App: React.FC = () => {
  // Demonstration of using some type of external state
  // management that isn't tapis-redux
  const [jwt, setJwt] = useState<string>(null);
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

  // Demonstration of config to use alternate URLs or provided tokens
  const config = {
    jwt,
    tenant: 'https://dev.develop.tapis.io',
  };

  return (
    <div className="workbench-wrapper">
      <Router>
        <Sidebar jwt={jwt}/>
        <div className="workbench-content">
          <Route exact path='/'>
            <div>Hello World!</div>
          </Route>
          <Route path='/login'>
            <Login config={config} onAuth={authCallback} />
          </Route>
          <Route path='/systems'>
            <Systems config={config} onList={systemsListCallback} />
          </Route>
          <Route path='/uipatterns' component={UIPatterns} />
        </div>
      </Router>
    </div>
  );
}

export default hot(App);
