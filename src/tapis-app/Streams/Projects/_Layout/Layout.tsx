import React from 'react';
import {
  PageLayout,
  LayoutHeader
} from 'tapis-ui/_common';

import { Router } from '../_Router';

const Layout: React.FC = () => {
  const header = (
    <LayoutHeader>
      <div>Projects</div>
    </LayoutHeader>
  );

  const body = (
    <Router />
  );

  return <PageLayout top={header} left={body} />;
};

export default Layout;
