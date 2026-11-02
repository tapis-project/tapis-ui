import React from 'react';
import {
  Route,
  useRouteMatch,
  RouteComponentProps,
  Switch,
} from 'react-router-dom';
import SystemDetail from '../SystemDetail';
import SystemsOverview from '../_components/SystemsOverview';
import NotFound from 'app/_components/NotFound';

const Router: React.FC = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}`} exact>
        <SystemsOverview />
      </Route>

      <Route
        path={`${path}/:systemId`}
        exact
        render={({
          match: {
            params: { systemId },
          },
        }: RouteComponentProps<{ systemId: string }>) => {
          return <SystemDetail systemId={systemId} />;
        }}
      />

      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
};

export default Router;
