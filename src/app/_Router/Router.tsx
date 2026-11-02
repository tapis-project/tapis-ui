import React, { Suspense, lazy, useEffect } from 'react';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';
import { ProtectedRoute } from '@tapis/tapisui-common';
import { Authenticator as Auth, useTapisConfig } from '@tapis/tapisui-hooks';

// Keep critical/landing components as regular imports
import Login from '../Login';
import Dashboard from '../Dashboard';
import OAuth2 from '../OAuth2';
import ErrorBoundary from '../_components/ErrorBoundary';
import NotFound from '../_components/NotFound';
import RouteLoader from '../_components/RouteLoader';

// Lazy load heavy feature components
const Apps = lazy(() => import('../Apps'));
const Jobs = lazy(() => import('../Jobs'));
const Systems = lazy(() => import('../Systems'));
const Pods = lazy(() => import('../Pods'));
const Files = lazy(() => import('../Files'));
const Workflows = lazy(() => import('../Workflows'));
const MLHub = lazy(() => import('../MLHub'));
const Authenticator = lazy(() => import('../Authenticator'));
const Settings = lazy(() => import('../Settings'));
// the dev/admin catalog — reachable at #/components, not in the sidebar
const ComponentsCatalog = lazy(() => import('../Components'));
const UIPatterns = lazy(() => import('../UIPatterns'));

import { useExtension } from 'extensions';

const Router: React.FC = () => {
  const { accessToken } = useTapisConfig();
  const { logout } = Auth.useLogin();
  const { extension } = useExtension();
  const landingRoute = extension?.serviceMap?.['home']?.route;
  // Deployments with a prelogin config keep unauthenticated visitors inside
  // the app: protected routes bounce to the public prelogin landing (where
  // the app chrome opens a login modal over it) instead of the /login page.
  // The configured mainRoute must resolve to a route the extension actually
  // registered as public — a config typo would otherwise send every
  // unauthenticated visitor to a route nothing matches (blank page), so an
  // unresolvable value falls back to the plain /login behavior.
  const configuredMainRoute = extension?.prelogin?.mainRoute;
  const mainRouteValid =
    !!configuredMainRoute &&
    !!extension &&
    Object.values(extension.serviceMap).some(
      (service) =>
        extension.isPublicService(service.id) &&
        service.route === configuredMainRoute
    );
  const preloginRedirect = mainRouteValid ? configuredMainRoute : undefined;
  useEffect(() => {
    if (configuredMainRoute && !mainRouteValid) {
      console.warn(
        `prelogin.mainRoute '${configuredMainRoute}' does not match any ` +
          'public service route (a service listed in prelogin.sidebarServices) ' +
          '— falling back to /login for unauthenticated visitors.'
      );
    }
  }, [configuredMainRoute, mainRouteValid]);

  return (
    <Switch>
      <Route exact path="/">
        {accessToken?.access_token ? (
          landingRoute ? (
            <Redirect to={landingRoute} />
          ) : (
            <Dashboard />
          )
        ) : preloginRedirect ? (
          <Redirect to={preloginRedirect} />
        ) : landingRoute ? (
          // No prelogin config: the landing service is protected, so this
          // lands on /login via ProtectedRoute — same as redirecting there.
          <Redirect to={landingRoute} />
        ) : (
          // Unauthed users go straight to the login screen instead of a
          // Dashboard interstitial with a "Proceed to login" link. The
          // read-only dashboard stays reachable at /dashboard (linked from
          // the login page).
          <Redirect to="/login" />
        )}
      </Route>
      <Route exact path="/dashboard">
        <Dashboard />
      </Route>
      <Route path="/login">
        <Login />
      </Route>
      <Route
        path="/logout"
        render={() => {
          logout();
          // ?stay=1 suppresses the implicit-only auto-redirect so logout is
          // durable — otherwise a live IdP session silently re-logs-in.
          return <Redirect to="/login?stay=1" />;
        }}
      />
      <Route path="/oauth2">
        <OAuth2 />
      </Route>
      <ProtectedRoute
        accessToken={accessToken?.access_token}
        redirectTo={preloginRedirect}
        path="/systems"
      >
        <Suspense fallback={<RouteLoader />}>
          <Systems />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute
        accessToken={accessToken?.access_token}
        redirectTo={preloginRedirect}
        path="/apps"
      >
        <Suspense fallback={<RouteLoader />}>
          <Apps />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute
        accessToken={accessToken?.access_token}
        redirectTo={preloginRedirect}
        path="/jobs"
      >
        <Suspense fallback={<RouteLoader />}>
          <Jobs />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute
        accessToken={accessToken?.access_token}
        redirectTo={preloginRedirect}
        path="/files"
      >
        <Suspense fallback={<RouteLoader />}>
          <Files />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute
        accessToken={accessToken?.access_token}
        redirectTo={preloginRedirect}
        path="/workflows"
      >
        <Suspense fallback={<RouteLoader />}>
          <Workflows />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute
        accessToken={accessToken?.access_token}
        redirectTo={preloginRedirect}
        path="/mlhub"
      >
        <Suspense fallback={<RouteLoader />}>
          <MLHub />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute
        accessToken={accessToken?.access_token}
        redirectTo={preloginRedirect}
        path="/pods"
      >
        <Suspense fallback={<RouteLoader />}>
          <Pods />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute
        accessToken={accessToken?.access_token}
        redirectTo={preloginRedirect}
        path="/authenticator"
      >
        <Suspense fallback={<RouteLoader />}>
          <Authenticator />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute
        accessToken={accessToken?.access_token}
        redirectTo={preloginRedirect}
        path="/settings"
      >
        <Suspense fallback={<RouteLoader />}>
          <Settings />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute
        accessToken={accessToken?.access_token}
        redirectTo={preloginRedirect}
        path="/components"
      >
        <Suspense fallback={<RouteLoader />}>
          <ComponentsCatalog />
        </Suspense>
      </ProtectedRoute>
      {extension &&
        Object.entries(extension.serviceMap).map(([_, service]) => {
          const Component = service.component;
          if (Component !== undefined) {
            // Services in the extension's prelogin sidebar render without
            // authentication (their component gets accessToken: undefined).
            // Suspense so an extension can declare its page with React.lazy
            // and keep its dependencies out of the entry bundle. Harmless for
            // the eager components that have not been converted yet.
            if (extension.isPublicService(service.id)) {
              return (
                <Route path={service.route} key={`ext-route-${service.id}`}>
                  <Suspense fallback={<RouteLoader />}>
                    <Component accessToken={accessToken?.access_token} />
                  </Suspense>
                </Route>
              );
            }
            return (
              <ProtectedRoute
                accessToken={accessToken?.access_token}
                redirectTo={preloginRedirect}
                path={service.route}
                key={`ext-route-${service.id}`}
              >
                <Suspense fallback={<RouteLoader />}>
                  <Component accessToken={accessToken?.access_token} />
                </Suspense>
              </ProtectedRoute>
            );
          }
          return null;
        })}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
};

// A crash on one page keeps the shell, and the next navigation clears it.
const GuardedRouter: React.FC = () => {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary resetKey={pathname}>
      <Router />
    </ErrorBoundary>
  );
};

export default GuardedRouter;
