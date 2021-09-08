import React from 'react';
import {
  PageLayout,
  LayoutBody,
  LayoutHeader,
  LayoutNavWrapper,
} from 'tapis-ui/_common';
import { SystemsNav } from '../_components';
import { Router } from '../_Router';

const Layout: React.FC = () => {
  const header = (
    <LayoutHeader>
      <div>System List</div>
    </LayoutHeader>
  );

  const sidebar = (
    <LayoutNavWrapper>
      <SystemsNav />
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
