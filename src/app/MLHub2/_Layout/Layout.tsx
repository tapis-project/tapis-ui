import { useState } from 'react';
import { PageLayout, LayoutBody } from '@tapis/tapisui-common';
import { Router } from '../_Router';

const Layout: React.FC = () => {
  const body = <Router />;

  return <PageLayout right={body} />;
};

export default Layout;
