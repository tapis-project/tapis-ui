import React from 'react';
import { Router } from '../_Router';
import { PageLayout, LayoutBody } from '@tapis/tapisui-common';

const Layout: React.FC = () => {
  const body = (
    <LayoutBody>
      <Router />
    </LayoutBody>
  );

  return <PageLayout right={body} />;
};

export default Layout;
