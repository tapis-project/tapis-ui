import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';

const Router: React.FC = () => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route path={`${path}`} exact></Route>
    </Switch>
  );
};

export default Router;
