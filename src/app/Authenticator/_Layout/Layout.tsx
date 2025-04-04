import { PageLayout, LayoutBody } from '@tapis/tapisui-common';
import { Menu } from '../_components';
import Router from '../_Router';
import React from 'react';

const Layout: React.FC = () => {
  const body = (
    <LayoutBody>
      <Menu />

      <Router />
    </LayoutBody>
  );

  return <PageLayout right={body} />;
};

export default Layout;
