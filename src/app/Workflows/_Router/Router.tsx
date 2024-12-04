import React from 'react';
import { Route, useRouteMatch, Switch } from 'react-router-dom';
import { Dashboard } from '../Dashboard';
import { default as PipelinesLayout } from '../Pipelines';
import { default as ArchivesLayout } from '../Archives';
import { default as GroupsLayout } from '../Groups';
import { default as SecretsLayout } from '../Secrets';

const Router: React.FC = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}`} exact>
        <Dashboard />
      </Route>

      <Route path={`${path}/groups`}>
        <GroupsLayout />
      </Route>

      <Route path={`${path}/archives`}>
        <ArchivesLayout />
      </Route>

      <Route path={`${path}/pipelines`}>
        <PipelinesLayout />
      </Route>

      <Route path={`${path}/secrets`}>
        <SecretsLayout />
      </Route>

      {/* <Route path={`${path}/identities`}>
        <IdentitiesLayout />
      </Route> */}

      {/* <Route
        path={`${path}/groups/:groupId`}
        exact
        render={({
          match: {
            params: { groupId },
          },
        }: RouteComponentProps<{
          groupId: string;
        }>) => (
          <div>
            <Users groupId={groupId}/>
          </div>
        )}
      /> */}

      {/* <Route
        path={`${path}/:groupId`}
        exact
        render={({
          match: {
            params: { groupId },
          },
        }: RouteComponentProps<{
          groupId: string;
        }>) => (
          <div>
            <Toolbar/>
            <WorkflowsDashboard groupId={groupId}/>
          </div>
        )}
      /> */}

      {/* <Route
        path={`${path}/:groupId/pipelines`}
        exact
        render={({
          match: {
            params: { groupId },
          },
        }: RouteComponentProps<{
          groupId: string;
        }>) => (
          <div>
            <Toolbar/>
            <WorkflowsDashboard groupId={groupId}/>
          </div>
        )}
      /> */}

      {/* <Route
        path={`${path}/:groupId/archives`}
        exact
        render={({
          match: {
            params: { groupId },
          },
        }: RouteComponentProps<{
          groupId: string;
        }>) => (
          <Archives groupId={groupId}/>
        )}
      />

      <Route
        path={`${path}/:groupId/pipelines/:pipelineId`}
        exact
        render={({
          match: {
            params: { groupId, pipelineId },
          },
        }: RouteComponentProps<{
          groupId: string;
          pipelineId: string;
        }>) => (
          <div>
            Edit Pipeline
          </div>
        )}
      />

      <Route
        path={`${path}/:groupId/pipelines/:pipelineId/runs`}
        render={({
          match: {
            params: { groupId, pipelineId },
          },
        }: RouteComponentProps<{
          groupId: string;
          pipelineId: string;
        }>) => (
          <div>
            <PipelineRuns groupId={groupId} pipelineId={pipelineId}/>
          </div>
        )}
      /> */}
    </Switch>
  );
};

export default Router;
