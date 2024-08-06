import React from 'react';
import {
  Route,
  useRouteMatch,
  RouteComponentProps,
  Switch,
} from 'react-router-dom';
import JobLauncher from '../JobLauncher';
import { SectionMessage } from '@tapis/tapisui-common';

const Router: React.FC = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}`} exact>
        <div style={{ margin: '1rem', flex: 1, overflow: 'auto' }}>
          <SectionMessage type="info">
            Select an app from the list.
          </SectionMessage>
        </div>
      </Route>

      <Route
        path={`${path}/:appId/:appVersion`}
        render={({
          match: {
            params: { appVersion, appId },
          },
        }: RouteComponentProps<{
          appId: string;
          appVersion: string;
        }>) => <JobLauncher appId={appId} appVersion={appVersion} />}
      />
    </Switch>
  );
};

export default Router;
