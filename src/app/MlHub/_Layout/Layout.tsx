import React from 'react';
import { Router } from '../_Router';
import { PageLayout, LayoutBody } from '@tapis/tapisui-common';
import { Menu } from '../_components';

const Layout: React.FC = () => {
  const header = (
    <div>
      <Menu />
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
