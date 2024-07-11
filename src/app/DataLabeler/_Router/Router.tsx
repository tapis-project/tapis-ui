import React from 'react';
import { Route, useRouteMatch, Switch } from 'react-router-dom';
import { Dashboard } from '../Dashboard';
import { default as Datasets } from '../Datasets';
import { default as AutoLabeling } from '../AutoLabeling';
import { default as ManulaLabeling } from '../ManualLabeling';

const Router: React.FC = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}`} exact>
        <Dashboard />
      </Route>

      <Route path={`${path}/datasets`}>
        <Datasets />
      </Route>

      <Route path={`${path}/auto`}>
        <AutoLabeling />
      </Route>

      <Route path={`${path}/manual`}>
        <ManulaLabeling />
      </Route>
    </Switch>
  );
};

export default Router;
