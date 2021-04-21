import { hot } from 'react-hot-loader/root';
import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Login from '../Login';
import Sidebar from '../Sidebar/Sidebar';
import Systems from '../Systems';
import UIPatterns from '../UIPatterns';
import './App.scss';

const App = () => {
  // Demonstration of using some type of external state
  // management that isn't tapis-redux
  const [token, setToken] = useState(null);
  const authCallback = useCallback(
    (result) => {
      /* eslint-disable */
      console.log("Authentication api result", result);
      // Handle errors during login
      if (result instanceof Error) {
        return;
      }
      // Set local view state
      setToken(result);
      // Can make also make an external call to propagate the login result
    },
    [setToken]
  );

  const systemsListCallback = useCallback(
    (result) => {
      /* eslint-disable */
      console.log("Systems listing api result", result);
    },
  )

  // Demonstration of config to use alternate URLs or provided tokens
  const config = {
    token: token,
    tenant: 'https://tacc.tapis.io/v3',
    authenticator: 'https://tacc.tapis.io/v3/oauth2',
  };

  return (
    <div className="workbench-wrapper">
      <Router>
        <Sidebar token={token != null}/>
        <div className="workbench-content">
          <Route exact path='/'>
            <div>Hello World!</div>
          </Route>
          <Route path='/login'>
            <Login config={config} onApi={authCallback} />
          </Route>
          <Route path='/systems'>
            <Systems config={config} onApi={systemsListCallback} />
          </Route>
          <Route path='/uipatterns' component={UIPatterns} />
        </div>
      </Router>
    </div>
  );
}

export default hot(App);
