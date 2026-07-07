import React from 'react';
import {
  Route,
  useRouteMatch,
  Switch,
  RouteComponentProps,
} from 'react-router-dom';
import Datasets from '../Datasets';
import DatasetDetails from '../DatasetDetails';

const Router: React.FC = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}`} exact>
        <Datasets />
      </Route>

      <Route
        path={`${path}/:datasetId+`}
        render={({
          match: {
            params: { datasetId },
          },
        }: RouteComponentProps<{ datasetId: string }>) => {
          return <DatasetDetails datasetId={datasetId} />;
        }}
      />
    </Switch>
  );
};

export default Router;
