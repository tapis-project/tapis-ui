import React from 'react';
import { Route, Redirect, RouteComponentProps } from 'react-router-dom';
import { loginPromptState } from './loginPromptState';

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
type ProtectedRouteProps = {
  accessToken: string | undefined;
  path: string;
  // Where unauthenticated visitors go instead of /login — deployments with a
  // public pre-login page send them there, with loginPromptState so the app
  // chrome opens the login modal over it (state.from carries the originally
  // requested location either way).
  redirectTo?: string;
};

const ProtectedRoute: React.FC<
  React.PropsWithChildren<ProtectedRouteProps>
> = ({ accessToken, redirectTo, children, ...rest }) => {
  return (
    <Route
      {...rest}
      render={({ location }: RouteComponentProps) =>
        accessToken ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: redirectTo ?? '/login',
              state: redirectTo
                ? loginPromptState({ from: location })
                : { from: location },
            }}
          />
        )
      }
    />
  );
};

export default ProtectedRoute;
