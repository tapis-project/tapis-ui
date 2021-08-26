import React from 'react';
import {
  Route,
  Switch,
  useRouteMatch,
  RouteComponentProps
} from 'react-router-dom';
import { AppsListing } from 'tapis-ui/components/apps';
import JobLauncher from 'tapis-ui/components/jobs/JobLauncher';
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
          <AppsListing/>
        </ListSectionList>
        <ListSectionDetail>
          <ListSectionHeader type={'sub-header'}>
            Job Launcher
          </ListSectionHeader>
          <Switch>
            <Route path={`${path}`} exact>
              <SectionMessage type="info">
                Select an app from the list.
              </SectionMessage>
            </Route>

            <Route
              path={`${path}/:appId/:appVersion`}
              render={({
                match
              }: RouteComponentProps<{
                appId: string;
                appVersion: string;
              }>) => (
                <JobLauncher
                  appId={match.params.appId}
                  appVersion={match.params.appVersion}
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
