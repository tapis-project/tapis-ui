import React from 'react';
import { Route, useRouteMatch, RouteComponentProps } from 'react-router-dom';
import { JobsNav } from 'tapis-ui/components/jobs';
import { JobDetail } from 'tapis-ui/components/jobs';
import { SectionMessage } from 'tapis-ui/_common';
import { Layout } from 'tapis-app/Layout';
import {
  SectionBody,
  SectionHeader,
  SectionNavWrapper,
} from 'tapis-app/Sections/Section';

const Jobs: React.FC = () => {
  const { path } = useRouteMatch();

  const header = (
    <SectionHeader>
      <div>Jobs</div>
    </SectionHeader>
  );

  const subHeader = (
    <SectionHeader type={'sub-header'}>Job Details</SectionHeader>
  );

  const sidebar = (
    <SectionNavWrapper>
      <JobsNav />
    </SectionNavWrapper>
  );

  const body = (
    <div style={{ flex: 1 }}>
      <Route path={`${path}`} exact>
        <SectionMessage type="info">Select a job from the list.</SectionMessage>
      </Route>

      <Route
        path={`${path}/:jobUuid`}
        render={({
          match: {
            params: { jobUuid },
          },
        }: RouteComponentProps<{ jobUuid: string }>) => (
          <JobDetail jobUuid={jobUuid} />
        )}
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

export default Jobs;
