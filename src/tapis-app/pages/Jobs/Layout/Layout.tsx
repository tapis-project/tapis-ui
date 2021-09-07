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

  const sidebar = (
    <LayoutNavWrapper>
      <JobsNav />
    </LayoutNavWrapper>
  );

  const body = (
    <LayoutBody>
      <Router />
    </LayoutBody>
  );

  return <PageLayout top={header} left={sidebar} right={body} />;
};

export default Layout;
