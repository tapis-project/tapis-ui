import React from 'react';
import {
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
  useLocation,
  useRouteMatch,
} from 'react-router-dom';
import { default as Pipeline } from '../Pipeline';
import { default as PipelineRunsLayout } from '../../PipelineRuns';
import { default as TaskLayout } from '../../Task';
import { Menu } from 'app/Workflows/Pipelines/Pipeline/_components';

const Router: React.FC = () => {
  const location = useLocation();
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}`} exact>
        <Redirect to={`${location.pathname}/tasks`} />
      </Route>
      <Route
        path={`/workflows/pipelines/:groupId/:pipelineId/tasks/:taskId`}
        exact
      >
        <TaskLayout />
      </Route>
      <Route path={`/workflows/pipelines/:groupId/:pipelineId/runs`}>
        <>
          <Menu tab={'runs'} />
          <PipelineRunsLayout />
        </>
      </Route>
      <Route
        path={`/workflows/pipelines/:groupId/:pipelineId/:tab`}
        render={({
          match: {
            params: { groupId, pipelineId, tab },
          },
        }: RouteComponentProps<{
          groupId: string;
          pipelineId: string;
          tab: string;
        }>) => (
          <>
            <Menu tab={tab} />
            <Pipeline groupId={groupId} pipelineId={pipelineId} tab={tab} />
          </>
        )}
      />
    </Switch>
  );
};

export default Router;
