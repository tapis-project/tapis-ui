import React from 'react';
import {
  Route,
  useRouteMatch,
  RouteComponentProps,
  Switch,
} from 'react-router-dom';
import NotFound from 'app/_components/NotFound';
import JobDetail from '../JobDetail';
import JobsDashboard from '../_components/JobsDashboard';

const Router: React.FC = () => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route path={`${path}`} exact>
        <JobsDashboard />
      </Route>

      <Route
        path={`${path}/:jobUuid`}
        exact
        render={({
          match: {
            params: { jobUuid },
          },
        }: RouteComponentProps<{ jobUuid: string }>) => (
          <JobDetail jobUuid={jobUuid} />
        )}
      />

      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
};

export default Router;
