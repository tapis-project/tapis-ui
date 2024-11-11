import React from 'react';
import { AppsNav } from '../_components';
import {
  PageLayout,
  LayoutBody,
  LayoutHeader,
  LayoutNavWrapper,
} from '@tapis/tapisui-common';
import AppsToolbar from '../_components/AppsToolbar';

import { Router } from '../_Router';
import AppsHelp from 'app/_components/Help/AppsHelp';

const Layout: React.FC = () => {
  const header = (
    <LayoutHeader>
      <span>
        Apps
        <span style={{ marginLeft: '16px' }}>
          <AppsHelp />
        </span>
      </span>
      <AppsToolbar />
    </LayoutHeader>
  );

  const sidebar = (
    <LayoutNavWrapper>
      <AppsNav />
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
