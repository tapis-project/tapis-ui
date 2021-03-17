import React from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import { useAuth } from 'tapis-redux';
import Login from '../Login';
import Systems from '../Systems';
import UIPatterns from '../UIPatterns';
import './Sidebar.global.scss';
import './Sidebar.module.scss';

const Sidebar = () => {
  const { user } = useAuth();
  return (
    <Router>
      <div>
        <nav>
          <div>
            <Link to="/">Home</Link>
          </div>
          <div>
            <Link to="/login">Login</Link>
          </div>
          {user && (
            <div>
              <Link to="/systems">Systems</Link>
            </div>
          )}
          <div>
            <Link to="/uipatterns">UI Patterns</Link>
          </div>
        </nav>
      </div>
      <hr />
      <Switch>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/systems">{user && <Systems />}</Route>
        <Route path="/uipatterns">
          <UIPatterns />
        </Route>
        <Route path="/">
          <div>Home</div>
        </Route>
      </Switch>
    </Router>
  );
};

export default Sidebar;
