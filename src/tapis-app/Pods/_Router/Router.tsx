import React from 'react';
import {
  Route,
  useRouteMatch,
  RouteComponentProps,
  Switch,
} from 'react-router-dom';
import PodDetail from '../PodDetail';
import { SectionMessage } from '@tapis/tapisui-common';

const Router: React.FC = () => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route path={`${path}`} exact>
        <SectionMessage type="info">Select a pod from the list.</SectionMessage>
      </Route>

      <Route
        path={`${path}/:podId`}
        render={({
          match: {
            params: { podId },
          },
        }: RouteComponentProps<{ podId: string }>) => (
          <PodDetail podId={podId} />
        )}
      />
    </Switch>
  );
};

export default Router;
