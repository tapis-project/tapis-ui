import React from 'react';
import {
  Route,
  useRouteMatch,
  Switch,
  RouteComponentProps,
} from 'react-router-dom';
import Datasets from '../Datasets';

const Router: React.FC = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}`} exact>
        <Datasets />
      </Route>
    </Switch>
  );
};

export default Router;
