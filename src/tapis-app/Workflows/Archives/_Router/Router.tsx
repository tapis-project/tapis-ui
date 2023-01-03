import React from 'react';
import { Route, useRouteMatch, Switch } from 'react-router-dom';

import { default as ArchivesLayout } from '../Archives';
import { default as ArchiveLayout } from '../Archive';

const Router: React.FC = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}`} exact>
        <ArchivesLayout />
      </Route>

      <Route path={`${path}/:groupId`} exact>
        <ArchivesLayout />
      </Route>

      <Route path={`${path}/:groupId/:archiveId`} exact>
        <ArchiveLayout />
      </Route>
    </Switch>
  );
};

export default Router;
