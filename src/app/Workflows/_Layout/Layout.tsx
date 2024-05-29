import React from 'react';
import { Router } from '../_Router';
import {
  PageLayout,
  LayoutBody,
  LayoutHeader,
  Breadcrumbs,
  breadcrumbsFromPathname,
} from '@tapis/tapisui-common';
import { useLocation } from 'react-router';
import styles from './Layout.module.scss';
import { Menu } from '../_components';

const Layout: React.FC = () => {
  const { pathname } = useLocation();
  const crumbs = breadcrumbsFromPathname(pathname).splice(1);
  const header = (
    <div>
      <LayoutHeader>
        <div className={styles.breadcrumbs}>
          <Breadcrumbs
            breadcrumbs={[{ text: 'Workflows', to: '/workflows' }, ...crumbs]}
            truncate={false}
          />
        </div>
      </LayoutHeader>
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
