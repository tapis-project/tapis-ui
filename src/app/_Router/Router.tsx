import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { ProtectedRoute } from '@tapis/tapisui-common';
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
import OAuth2 from '../OAuth2';
import UIPatterns from '../UIPatterns';
import { useExtension } from 'extensions';

const Router: React.FC = () => {
  const { accessToken } = useTapisConfig();
  const { logout } = Authenticator.useLogin();
  const { extension } = useExtension();

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
      <Route path="/oauth2">
        <OAuth2 />
      </Route>
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
      {extension &&
        Object.entries(extension.serviceMap).map(([_, service]) => {
          const Component = service.component;
          if (Component !== undefined) {
            return (
              <ProtectedRoute
                accessToken={accessToken?.access_token}
                path={service.route}
                key={`ext-route-${service.id}}`}
              >
                <Component accessToken={accessToken?.access_token} />
              </ProtectedRoute>
            );
          }
          return <></>;
        })}
    </Switch>
  );
};

export default Router;
