import React from 'react';
import {
  Route,
  useRouteMatch,
  Switch,
  RouteComponentProps,
} from 'react-router-dom';
import { Models } from '../../Models';
import ModelDetails from '../ModelDetails';

const Router: React.FC = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}`} exact>
        <Models />
      </Route>

      <Route
        path={`${path}/:modelId+`}
        render={({
          match: {
            params: { modelId },
          },
        }: RouteComponentProps<{ modelId: string }>) => {
          return <ModelDetails modelId={modelId} />;
        }}
      />
    </Switch>
  );
};

export default Router;
