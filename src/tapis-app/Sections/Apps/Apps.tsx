import React from 'react';
import {
  Route,
  Switch,
  useRouteMatch,
  RouteComponentProps
} from 'react-router-dom';
import { AppsNav } from 'tapis-ui/components/apps';
import { JobLauncher } from 'tapis-app/Sections/Apps/JobLauncher';
import { SectionMessage } from 'tapis-ui/_common';
import {
  ListSection,
  ListSectionBody,
  ListSectionDetail,
  ListSectionList,
  ListSectionHeader
} from 'tapis-app/Sections/ListSection';

const Apps: React.FC = () => {

  const { path } = useRouteMatch();

  return (
    <ListSection>
      <ListSectionHeader>
        <div>Apps</div>
      </ListSectionHeader>
      <ListSectionBody>
        <ListSectionList>
          <AppsNav />
        </ListSectionList>
        <ListSectionDetail>
          <ListSectionHeader type={'sub-header'}>
            Job Launcher
          </ListSectionHeader>
          <Switch>
            {
              // If path is an exact match, no app has been selected
            }
            <Route path={`${path}`} exact>
              <SectionMessage type="info">
                Select an app from the list.
              </SectionMessage>
            </Route>
            <Route
              path={`${path}/:appId/:appVersion`}
              render={({
                match: {params: {appVersion, appId}}
              }: RouteComponentProps<{
                appId: string;
                appVersion: string;
              }>) => (
                <JobLauncher
                  appId={appId}
                  appVersion={appVersion}
                />
              )}
            />
          </Switch>
        </ListSectionDetail>
      </ListSectionBody>
    </ListSection>
  );
};

export default Apps;
