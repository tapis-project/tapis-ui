import React from 'react';
import { Router } from '../_Router';
import { PageLayout, LayoutBody } from '@tapis/tapisui-common';
import { TopNavbar } from '../_components';

const Layout: React.FC = () => {
  const header = (
    <div>
      <TopNavbar />
    </div>
  );

  const body = (
    <LayoutBody>
      <Router />
    </LayoutBody>
  );

  return <PageLayout top={header} right={body} />;
};

export default Layout;
