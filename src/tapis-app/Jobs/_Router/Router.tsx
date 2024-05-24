import React from 'react';
import {
  Route,
  useRouteMatch,
  RouteComponentProps,
  Switch,
} from 'react-router-dom';
import JobDetail from '../JobDetail';
import { SectionMessage } from '@tapis/tapisui-common';

const Router: React.FC = () => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route path={`${path}`} exact>
        <SectionMessage type="info">Select a job from the list.</SectionMessage>
      </Route>

      <Route
        path={`${path}/:jobUuid`}
        render={({
          match: {
            params: { jobUuid },
          },
        }: RouteComponentProps<{ jobUuid: string }>) => (
          <JobDetail jobUuid={jobUuid} />
        )}
      />
    </Switch>
  );
};

export default Router;
