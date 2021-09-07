import React from 'react';
import { AppsNav } from '../components';
import {
  PageLayout,
  LayoutBody,
  LayoutHeader,
  LayoutNavWrapper,
} from 'tapis-ui/_common';

import { Router } from '../Router';

const Layout: React.FC = () => {
  const header = (
    <LayoutHeader>
      <div>Apps</div>
    </LayoutHeader>
  );

  const subHeader = (
    <LayoutHeader type={'sub-header'}>Job Launcher</LayoutHeader>
  );

  const sidebar = (
    <LayoutNavWrapper>
      <AppsNav />
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
