import React from 'react';
import {
  Route,
  useRouteMatch,
  RouteComponentProps,
  Switch,
} from 'react-router-dom';

import { default as ManualLabeling } from '../ManualLabeling';

const Router: React.FC = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={path} exact>
        <ManualLabeling />
      </Route>
    </Switch>
  );
};

export default Router;
