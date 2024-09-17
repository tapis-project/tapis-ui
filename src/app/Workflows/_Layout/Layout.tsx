import React from 'react';
import { Router } from '../_Router';
import { Menu } from '../_components';
import styles from './Layout.module.scss';
import { PageLayout, LayoutBody } from '@tapis/tapisui-common';

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
