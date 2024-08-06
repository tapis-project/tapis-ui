import React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';

import { default as Task } from '../Task';

const Router: React.FC = () => {
  return (
    <Switch>
      <Route
        path={`/workflows/pipelines/:groupId/:pipelineId/tasks/:taskId`}
        exact
        render={({
          match: {
            params: { groupId, pipelineId, taskId },
          },
        }: RouteComponentProps<{
          groupId: string;
          pipelineId: string;
          taskId: string;
        }>) => (
          <Task groupId={groupId} pipelineId={pipelineId} taskId={taskId} />
        )}
      />
    </Switch>
  );
};

export default Router;
