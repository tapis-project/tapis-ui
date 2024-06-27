import React from 'react';
import { Route, Redirect, RouteComponentProps } from 'react-router-dom';

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
type ProtectedRouteProps = RouteComponentProps & { accessToken: string | undefined, path: string };

const ProtectedRoute: React.FC<
  React.PropsWithChildren<ProtectedRouteProps>
> = ({ accessToken, path, children, ...rest }) => {
  return (
    <Route
      {...rest}
      path={path}
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
