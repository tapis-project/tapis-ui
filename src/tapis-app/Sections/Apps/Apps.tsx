import React from 'react';
import { Route, useRouteMatch, RouteComponentProps } from 'react-router-dom';
import { AppsNav } from 'tapis-ui/components/apps';
import { JobLauncher } from 'tapis-app/Sections/Apps/JobLauncher';
import { SectionMessage } from 'tapis-ui/_common';
import { Layout } from 'tapis-app/Layout';
import {
  SectionBody,
  SectionHeader,
  SectionNavWrapper
} from 'tapis-app/Sections/Section';

const Apps: React.FC = () => {
  const { path } = useRouteMatch();

  const header = (
    <SectionHeader>
      <div>Apps</div>
    </SectionHeader>
  );

  const subHeader = (
    <SectionHeader type={'sub-header'}>Job Launcher</SectionHeader>
  );

  const sidebar = (
    <SectionNavWrapper>
      <AppsNav />
    </SectionNavWrapper>
  );

  const body = (
    <div style={{ flex: 1 }}>
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
    </div>
  );

  return (
    <Layout
      top={header}
      left={sidebar}
      right={
        <SectionBody>
          <Layout top={subHeader} right={body} />
        </SectionBody>
      }
    />
  );
};

export default Apps;
