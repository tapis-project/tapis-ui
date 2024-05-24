import { Route, Redirect, RouteProps } from 'react-router-dom';

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
function ProtectedRoute({
  accessToken,
  children,
  ...rest
}: RouteProps & { accessToken?: string }) {
  return (
    <Route
      {...rest}
      render={({ location }: RouteProps) =>
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
}

export default ProtectedRoute;
