import React from 'react';
import {
  Route,
  useRouteMatch,
  RouteComponentProps,
  Switch,
} from 'react-router-dom';

import { default as AutoLabeling } from '../AutoLabeling';

const Router: React.FC = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={path} exact>
        <AutoLabeling />
      </Route>
    </Switch>
  );
};

export default Router;
