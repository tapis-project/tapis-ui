import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { SectionHeader, ProtectedRoute } from '@tapis/tapisui-common';
import { Authenticator, useTapisConfig } from '@tapis/tapisui-hooks';

import Apps from '../Apps';
import Login from '../Login';
import Dashboard from '../Dashboard';
import Jobs from '../Jobs';
import Systems from '../Systems';
import Pods from '../Pods';
import Files from '../Files';
import Workflows from '../Workflows';
import MlHub from '../MlHub';
import UIPatterns from '../UIPatterns';

const Router: React.FC = () => {
  const { accessToken } = useTapisConfig();
  const { logout } = Authenticator.useLogin();

  return (
    <Switch>
      <Route exact path="/">
        <Dashboard />
      </Route>
      <Route path="/login">
        <Login />
      </Route>
      <Route
        path="/logout"
        render={() => {
          logout();
          return <Redirect to="/login" />;
        }}
      />
      <ProtectedRoute accessToken={accessToken?.access_token} path="/systems">
        <Systems />
      </ProtectedRoute>
      <ProtectedRoute accessToken={accessToken?.access_token} path="/apps">
        <Apps />
      </ProtectedRoute>
      <ProtectedRoute accessToken={accessToken?.access_token} path="/jobs">
        <Jobs />
      </ProtectedRoute>
      <ProtectedRoute accessToken={accessToken?.access_token} path="/files">
        <Files />
      </ProtectedRoute>
      <ProtectedRoute accessToken={accessToken?.access_token} path="/workflows">
        <Workflows />
      </ProtectedRoute>
      <ProtectedRoute accessToken={accessToken?.access_token} path="/ml-hub">
        <MlHub />
      </ProtectedRoute>
      <ProtectedRoute accessToken={accessToken?.access_token} path="/pods">
        <Pods />
      </ProtectedRoute>
      <Route path="/uipatterns">
        <SectionHeader>UI Patterns</SectionHeader>
        <UIPatterns />
      </Route>
    </Switch>
  );
};

export default Router;
