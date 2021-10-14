import React from 'react';
import {
  PageLayout,
  LayoutBody,
  LayoutHeader,
  LayoutNavWrapper,
  Breadcrumbs,
} from 'tapis-ui/_common';
import { SystemsNav } from '../_components';
import Toolbar from '../_components/Toolbar';
import { Router } from '../_Router';

const Layout: React.FC = () => {
  const header = (
    <LayoutHeader>
      <Breadcrumbs items={['system-name-here']} />
      <Toolbar />
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
