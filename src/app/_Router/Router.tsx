import React, { Suspense, lazy } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { ProtectedRoute } from '@tapis/tapisui-common';
import { Authenticator as Auth, useTapisConfig } from '@tapis/tapisui-hooks';

// Keep critical/landing components as regular imports
import Login from '../Login';
import Dashboard from '../Dashboard';
import OAuth2 from '../OAuth2';
import RouteLoader from '../_components/RouteLoader';

// Lazy load heavy feature components
const Apps = lazy(() => import('../Apps'));
const Jobs = lazy(() => import('../Jobs'));
const Systems = lazy(() => import('../Systems'));
const Pods = lazy(() => import('../Pods'));
const Files = lazy(() => import('../Files'));
const Workflows = lazy(() => import('../Workflows'));
const MlHub = lazy(() => import('../MlHub'));
const Authenticator = lazy(() => import('../Authenticator'));
const UIPatterns = lazy(() => import('../UIPatterns'));

import { useExtension } from 'extensions';

const Router: React.FC = () => {
  const { accessToken } = useTapisConfig();
  const { logout } = Auth.useLogin();
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
        <Suspense fallback={<RouteLoader />}>
          <Systems />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute accessToken={accessToken?.access_token} path="/apps">
        <Suspense fallback={<RouteLoader />}>
          <Apps />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute accessToken={accessToken?.access_token} path="/jobs">
        <Suspense fallback={<RouteLoader />}>
          <Jobs />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute accessToken={accessToken?.access_token} path="/files">
        <Suspense fallback={<RouteLoader />}>
          <Files />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute accessToken={accessToken?.access_token} path="/workflows">
        <Suspense fallback={<RouteLoader />}>
          <Workflows />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute accessToken={accessToken?.access_token} path="/ml-hub">
        <Suspense fallback={<RouteLoader />}>
          <MlHub />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute accessToken={accessToken?.access_token} path="/pods">
        <Suspense fallback={<RouteLoader />}>
          <Pods />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute
        accessToken={accessToken?.access_token}
        path="/authenticator"
      >
        <Suspense fallback={<RouteLoader />}>
          <Authenticator />
        </Suspense>
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
