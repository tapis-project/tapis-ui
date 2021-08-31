import React from 'react';
import {
  Route,
  useRouteMatch,
  RouteComponentProps
} from 'react-router-dom';
import { JobsNav } from 'tapis-ui/components/jobs';
import { JobDetail } from 'tapis-ui/components/jobs';
import { SectionMessage } from 'tapis-ui/_common';
import { Layout } from 'tapis-app/Layout';
import {
  ListSectionDetail,
  ListSectionList,
  ListSectionHeader
} from 'tapis-app/Sections/ListSection';

const Jobs: React.FC = () => {
  const { path } = useRouteMatch();

  const header = (
    <ListSectionHeader>
      <div>Jobs</div>
    </ListSectionHeader>
  );

  const subHeader = (
    <ListSectionHeader type={'sub-header'}>Job Details</ListSectionHeader>
  );

  const sidebar = (
    <ListSectionList>
      <JobsNav />
    </ListSectionList>
  );

  const body = (
    <div style={{flex: 1}}>
      <ListSectionDetail>
        <Route path={`${path}`} exact>
          <SectionMessage type="info">
            Select a job from the list.
          </SectionMessage>
        </Route>

        <Route
          path={`${path}/:jobUuid`}
          render={({
            match: {
              params: { jobUuid }
            }
          }: RouteComponentProps<{ jobUuid: string }>) => (
            <JobDetail jobUuid={jobUuid} />
          )}
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

export default Jobs;
