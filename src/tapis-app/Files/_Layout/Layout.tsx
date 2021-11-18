import React from 'react';
import {
  PageLayout,
  LayoutBody,
  LayoutHeader,
  LayoutNavWrapper,
  Breadcrumbs,
} from 'tapis-ui/_common';
import { SystemsNav } from '../_components';
import { Router } from '../_Router';
import Toolbar from '../_components/Toolbar';
import { useLocation } from 'react-router';
import breadcrumbsFromPathname from 'tapis-ui/_common/Breadcrumbs/breadcrumbsFromPathname';
import styles from './Layout.module.scss';
import { FilesProvider } from '../_components/FilesContext';

const Layout: React.FC = () => {
  const { pathname } = useLocation();
  const crumbs = breadcrumbsFromPathname(pathname).splice(1);
  const header = (
    <LayoutHeader>
      <div className={styles.breadcrumbs}>
        <Breadcrumbs breadcrumbs={[{ text: 'Files' }, ...crumbs]} />
      </div>
      <Toolbar />
    </LayoutHeader>
  );

  const sidebar = (
    <LayoutNavWrapper>
      <SystemsNav />
    </LayoutNavWrapper>
  );

  const body = (
    <LayoutBody constrain>
      <Router />
    </LayoutBody>
  );

  return (
    <FilesProvider>
      <PageLayout top={header} left={sidebar} right={body} />
    </FilesProvider>
  );
};

export default Layout;
