import React from 'react';
import {
  Route,
  useRouteMatch,
  RouteComponentProps,
  Switch,
} from 'react-router-dom';
import { default as PagePods } from 'app/Pods/_components/PagePods';
import { default as PageImages } from 'app/Pods/_components/PageImages';
import { default as PageVolumes } from 'app/Pods/_components/PageVolumes';
import { default as PageSnapshots } from 'app/Pods/_components/PageSnapshots';
import { default as PageTemplates } from 'app/Pods/_components/PageTemplates';

import { SectionMessage } from '@tapis/tapisui-common';

const Router: React.FC = () => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route
        path={`${path}/images/:imageId*`}
        render={({
          match: {
            params: { imageId },
          },
        }: RouteComponentProps<{ imageId?: string }>) => (
          <div>
            <PageImages objId={imageId} />
          </div>
        )}
      />

      <Route
        path={`${path}/templates/:templateId/tags/:tagId`}
        render={({
          match: {
            params: { templateId, tagId },
          },
        }: RouteComponentProps<{ templateId?: string; tagId?: string }>) => (
          <div>
            <PageTemplates objId={templateId} tagId={tagId} />
          </div>
        )}
      />

      <Route
        path={`${path}/templates/:templateId?`}
        render={({
          match: {
            params: { templateId },
          },
        }: RouteComponentProps<{ templateId?: string }>) => (
          <div>
            <PageTemplates objId={templateId} tagId={''} />
          </div>
        )}
      />

      <Route
        path={`${path}/volumes/:volumeId?`}
        render={({
          match: {
            params: { volumeId },
          },
        }: RouteComponentProps<{ volumeId?: string }>) => (
          <div>
            <PageVolumes objId={volumeId} />
          </div>
        )}
      />

      <Route
        path={`${path}/snapshots/:snapshotId?`}
        render={({
          match: {
            params: { snapshotId },
          },
        }: RouteComponentProps<{ snapshotId?: string }>) => (
          <div>
            <PageSnapshots objId={snapshotId} />
          </div>
        )}
      />

      <Route
        path={`${path}/:podId?`}
        render={({
          match: {
            params: { podId },
          },
        }: RouteComponentProps<{ podId?: string }>) => (
          <PagePods objId={podId} />
        )}
      />
    </Switch>
  );
};

export default Router;
