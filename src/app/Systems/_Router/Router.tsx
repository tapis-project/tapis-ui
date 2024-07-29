import React from 'react';
import {
  Route,
  useRouteMatch,
  RouteComponentProps,
  Switch,
} from 'react-router-dom';
import SystemDetail from '../SystemDetail';
import { SectionMessage } from '@tapis/tapisui-common';

const Router: React.FC = () => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route path={`${path}`} exact>
        <div style={{ margin: '1rem', flex: 1, overflow: 'auto' }}>
          <SectionMessage type="info">
            Select a system from the list.
          </SectionMessage>
        </div>
      </Route>

      <Route
        path={`${path}/:systemId`}
        render={({
          match: {
            params: { systemId },
          },
        }: RouteComponentProps<{ systemId: string }>) => (
          <SystemDetail systemId={systemId} />
        )}
      />
    </Switch>
  );
};

export default Router;
