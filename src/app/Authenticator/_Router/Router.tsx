import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import NotFound from 'app/_components/NotFound';

const Router: React.FC = () => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route path={`${path}`} exact></Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
};

export default Router;
