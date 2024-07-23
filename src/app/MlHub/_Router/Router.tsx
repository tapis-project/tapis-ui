import React from 'react';
import { Route, useRouteMatch, Switch } from 'react-router-dom';
import { Dashboard } from '../Dashboard';
import { Layout as ModelsLayout } from '../Models/_Layout';
<<<<<<< HEAD
import { Layout as DatasetsLayout } from '../Datasets/_Layout';
=======
import { Layout as DatasetsLayout } from "../Datasets/_Layout"
>>>>>>> 96485ea75d8db4b48e864d20161e1a2e52551576

const Router: React.FC = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}`} exact>
        <Dashboard />
      </Route>

      <Route path={`${path}/models`}>
        <ModelsLayout />
      </Route>
<<<<<<< HEAD

      <Route path={`${path}/datasets`}>
=======
      
      <Route
        path={`${path}/datasets`}>
>>>>>>> 96485ea75d8db4b48e864d20161e1a2e52551576
        <DatasetsLayout />
      </Route>
    </Switch>
  );
};

export default Router;
