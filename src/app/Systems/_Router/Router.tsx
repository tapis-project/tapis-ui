import React from 'react';
import {
  Route,
  useRouteMatch,
  RouteComponentProps,
  Switch,
} from 'react-router-dom';
import SystemDetail from '../SystemDetail';
import SystemsOverview from '../_components/SystemsOverview';

const Router: React.FC = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}`} exact>
        <SystemsOverview />
      </Route>

      <Route
        path={`${path}/:systemId`}
        render={({
          match: {
            params: { systemId },
          },
        }: RouteComponentProps<{ systemId: string }>) => {
          return <SystemDetail systemId={systemId} />;
        }}
      />
    </Switch>
  );
};

export default Router;
