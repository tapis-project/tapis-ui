import React from 'react';
import { Route, useRouteMatch, Switch } from 'react-router-dom';

import { default as Secrets } from '../Secrets';

const Router: React.FC = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={path} exact>
        <Secrets />
      </Route>
    </Switch>
  );
};

export default Router;
