import React from 'react';
import {
  Route,
  useRouteMatch,
  RouteComponentProps
} from 'react-router-dom';
import { AppsNav } from 'tapis-ui/components/apps';
import { JobLauncher } from 'tapis-app/Sections/Apps/JobLauncher';
import { SectionMessage } from 'tapis-ui/_common';
import { Layout } from 'tapis-app/Layout';
import {
  ListSectionDetail,
  ListSectionList,
  ListSectionHeader
} from 'tapis-app/Sections/ListSection';

const Apps: React.FC = () => {
  const { path } = useRouteMatch();

  const header = (
    <ListSectionHeader>
      <div>Apps</div>
    </ListSectionHeader>
  );

  const subHeader = (
    <ListSectionHeader type={'sub-header'}>Job Launcher</ListSectionHeader>
  );

  const sidebar = (
    <ListSectionList>
      <AppsNav />
    </ListSectionList>
  );

  const body = (
    <div style={{ flex: 1 }}>
      <ListSectionDetail>
        <Route path={`${path}`} exact>
          <SectionMessage type="info">
            Select an app from the list.
          </SectionMessage>
        </Route>

        <Route
          path={`${path}/:appId/:appVersion`}
          render={({
            match: {
              params: { appVersion, appId }
            }
          }: RouteComponentProps<{
            appId: string;
            appVersion: string;
          }>) => <JobLauncher appId={appId} appVersion={appVersion} />}
        />
      </ListSectionDetail>
    </div>
  );

  return (
    <Layout
      top={header}
      left={sidebar}
      right={<Layout top={subHeader} right={body} />}
    />
  );
};

export default Apps;
