import { Route, Redirect, RouteProps } from 'react-router-dom';
import { useTapisConfig } from 'tapis-hooks';

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
function ProtectedRoute({ children, ...rest }: RouteProps) {
  const { accessToken } = useTapisConfig();
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
