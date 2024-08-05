import React from 'react';
import { Router } from '../_Router';
import {
  PageLayout,
  LayoutBody,
  LayoutHeader,
  Breadcrumbs,
} from '@tapis/tapisui-common';
import { useLocation } from 'react-router';
import { breadcrumbsFromPathname } from '@tapis/tapisui-common';
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
            breadcrumbs={[{ text: 'ML Edge', to: '/ml-edge' }, ...crumbs]}
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
