import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import ClientDetailsRedirect  from '../_components/ClientCard';  // Named import

const Router: React.FC = () => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route path={`${path}/authenticator/clients/:client_id`} component={ClientDetailsRedirect} />
    </Switch>
  );
};

export default Router;

