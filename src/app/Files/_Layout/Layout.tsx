import React from 'react';
import {
  PageLayout,
  LayoutBody,
  LayoutHeader,
  LayoutNavWrapper,
  Breadcrumbs,
} from '@tapis/tapisui-common';
import { SystemsNav } from '../_components';
import { Router } from '../_Router';
import Toolbar from '../_components/Toolbar';
import { useLocation } from 'react-router-dom';
import { breadcrumbsFromPathname } from '@tapis/tapisui-common';
import styles from './Layout.module.scss';
import { FilesProvider } from '../_components/FilesContext';
import FilesHelp from 'app/_components/Help/FilesHelp';

const Layout: React.FC = () => {
  const { pathname } = useLocation();
  const systemId = pathname.split('/')[2];
  const currentPath = pathname.split('/').splice(3).join('/');
  const crumbs = breadcrumbsFromPathname(pathname).splice(1);
  const header = (
    <LayoutHeader>
      <span className={`${styles['Files']}`}>
        Files
        <span className={`${styles['Files-Help']}`}>
          <FilesHelp />
        </span>
      </span>
      {/* <div className={styles.breadcrumbs}>
        
        <Breadcrumbs breadcrumbs={[{ text: 'Files' }, ...crumbs]} />
      </div> */}
      {systemId && <Toolbar systemId={systemId} currentPath={currentPath} />}
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
