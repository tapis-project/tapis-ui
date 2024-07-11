import React from 'react';
import {
  Route,
  useRouteMatch,
  RouteComponentProps,
  Switch,
} from 'react-router-dom';

import { default as Datasets } from '../Datasets';

const Router: React.FC = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={path} exact>
        <Datasets />
      </Route>
    </Switch>
  );
};

export default Router;
