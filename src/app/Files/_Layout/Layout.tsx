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
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@mui/material';
import { FolderOpen } from '@mui/icons-material';
import { breadcrumbsFromPathname } from '@tapis/tapisui-common';
import { FilesProvider } from '../_components/FilesContext';
import FilesHelp from 'app/_components/Help/FilesHelp';
import FilesV2 from '../V2';

const Layout: React.FC = () => {
  const { pathname, search, hash } = useLocation();
  const isV2 = pathname === '/files/v2' || pathname.startsWith('/files/v2/');
  const filesV2Url = `${pathname.replace(
    /^\/files(?=\/|$)/,
    '/files/v2'
  )}${search}${hash}`;
  const systemId = pathname.split('/')[2];
  const currentPath = pathname.split('/').splice(3).join('/');
  const crumbs = breadcrumbsFromPathname(pathname).splice(1);
  const header = (
    <LayoutHeader>
      <span>
        Files
        <span style={{ marginLeft: '16px' }}>
          <FilesHelp />
        </span>
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Button
          component={Link}
          to={filesV2Url}
          variant="outlined"
          size="small"
          startIcon={<FolderOpen />}
        >
          File Explorer V2
        </Button>
        {systemId && <Toolbar systemId={systemId} currentPath={currentPath} />}
      </span>
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
      {isV2 ? (
        <div style={{ height: '100%', minHeight: 0, overflow: 'hidden' }}>
          <FilesV2 />
        </div>
      ) : (
        <PageLayout top={header} left={sidebar} right={body} />
      )}
    </FilesProvider>
  );
};

export default Layout;
