import React from 'react';
import { Route, useRouteMatch, Switch } from 'react-router-dom';
import { Dashboard } from '../Dashboard';
import { Models } from '../Models';

const Router: React.FC = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}`} exact>
        <Dashboard />
      </Route>

      <Route path={`${path}/models`}>
        <Models />
      </Route>
    </Switch>
  );
};

export default Router;
