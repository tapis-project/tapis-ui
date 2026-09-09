import React from 'react';
import {
  Route,
  useRouteMatch,
  RouteComponentProps,
  Switch,
} from 'react-router-dom';
import AppDetails from '../AppDetails';
import AppsOverview from '../_components/AppsOverview';

const Router: React.FC = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}`} exact>
        <AppsOverview />
      </Route>

      <Route
        path={`${path}/:appId/:appVersion`}
        exact
        render={({
          match: {
            params: { appVersion, appId },
          },
        }: RouteComponentProps<{
          appId: string;
          appVersion: string;
        }>) => {
          return <AppDetails appId={appId} appVersion={appVersion} />;
        }}
      />
    </Switch>
  );
};

export default Router;
