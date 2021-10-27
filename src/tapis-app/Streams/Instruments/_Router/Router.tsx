import React from 'react';
import {
  Route,
  useRouteMatch,
  RouteComponentProps,
  Switch
} from 'react-router-dom';
import { SectionMessage } from 'tapis-ui/_common';
import MeasurementsListing from '../../MeasurementsListing';

const Router: React.FC<{ projectId: string, siteId: string }> = ({
  projectId,
  siteId
}) => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route path={`${path}`} exact>
        <SectionMessage type="info">
          Select an instrument from the list.
        </SectionMessage>
      </Route>

      <Route
        path={`${path}/:instrumentId`}
        render={({
          match: {
            params: { instrumentId }
          }
        }: RouteComponentProps<{ instrumentId: string }>) => (
          <MeasurementsListing projectId={projectId} siteId={siteId} instrumentId={instrumentId} />
        )}
      />
    </Switch>
  );
};

export default Router;
