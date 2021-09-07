import React from 'react';
import { JobsNav } from '../components';
import { Router } from '../Router';
import { Layout } from 'tapis-app/components';
import {
  SectionBody,
  SectionHeader,
  SectionNavWrapper,
} from 'tapis-app/components/Section';

const Jobs: React.FC = () => {
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
      <Router />
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
