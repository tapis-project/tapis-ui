import React from 'react';
import { Route, Redirect, RouteComponentProps } from 'react-router-dom';

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
type ProtectedRouteProps = {
  accessToken: string | undefined;
  path: string;
};

const ProtectedRoute: React.FC<
  React.PropsWithChildren<ProtectedRouteProps>
> = ({ accessToken, children, ...rest }) => {
  return (
    <Route
      {...rest}
      render={({ location }: RouteComponentProps) =>
        accessToken ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: location },
            }}
          />
        )
      }
    />
  );
};

export default ProtectedRoute;
