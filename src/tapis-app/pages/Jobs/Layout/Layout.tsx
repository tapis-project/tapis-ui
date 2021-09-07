import React from 'react';
import { JobsNav } from '../components';
import { Router } from '../Router';
import {
  PageLayout,
  LayoutBody,
  LayoutHeader,
  LayoutNavWrapper,
} from 'tapis-ui/_common';

const Layout: React.FC = () => {
  const header = (
    <LayoutHeader>
      <div>Jobs</div>
    </LayoutHeader>
  );

  const subHeader = (
    <LayoutHeader type={'sub-header'}>Job Details</LayoutHeader>
  );

  const sidebar = (
    <LayoutNavWrapper>
      <JobsNav />
    </LayoutNavWrapper>
  );

  const body = (
    <div style={{ flex: 1 }}>
      <Router />
    </div>
  );

  return (
    <PageLayout
      top={header}
      left={sidebar}
      right={
        <LayoutBody>
          <PageLayout top={subHeader} right={body} />
        </LayoutBody>
      }
    />
  );
};

export default Layout;
