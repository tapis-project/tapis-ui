import React from 'react';
import { Router } from '../_Router';
import {
  PageLayout,
  LayoutBody,
  LayoutHeader,
  Breadcrumbs,
} from '@tapis/tapisui-common';
import { breadcrumbsFromPathname } from '@tapis/tapisui-common';
import styles from './Layout.module.scss';
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
