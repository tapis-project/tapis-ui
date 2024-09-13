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
    <div style={{ marginLeft: '1rem', flex: 1, overflow: 'auto' }}>
      <LayoutBody>
        <Router />
      </LayoutBody>
    </div>
  );

  return <PageLayout top={header} right={body} />;
};

export default Layout;
