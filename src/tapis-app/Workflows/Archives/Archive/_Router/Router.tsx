import React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';

import { default as Archive } from '../Archive';

const Router: React.FC = () => {
  return (
    <Switch>
      <Route
        path={`/workflows/archives/:groupId/:archiveId`}
        exact
        render={({
          match: {
            params: { groupId, archiveId },
          },
        }: RouteComponentProps<{
          groupId: string;
          archiveId: string;
        }>) => <Archive groupId={groupId} archiveId={archiveId} />}
      />
    </Switch>
  );
};

export default Router;
