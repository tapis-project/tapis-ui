import React from 'react';
import {
  PageLayout,
  LayoutBody,
  LayoutHeader,
  LayoutNavWrapper,
  Breadcrumbs,
} from 'tapis-ui/_common';
import { SystemsNav } from '../_components';
import { Router } from '../_Router';
import Toolbar from '../_components/Toolbar';
import { useLocation } from 'react-router';
import breadcrumbsFromPathname from './breadcrumbsFromPathname';

const Layout: React.FC = () => {
  const { pathname } = useLocation();

  const header = (
    <LayoutHeader>
      <Breadcrumbs
        breadcrumbs={breadcrumbsFromPathname(pathname)}
      />
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
