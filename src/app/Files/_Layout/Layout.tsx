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
import { Box, IconButton, Tooltip } from '@mui/material';
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
        {/* Same weight as the file-operation toolbar it sits beside: an
            outlined Button next to those icon buttons made the escape
            hatch the loudest control in the header. */}
        <Tooltip arrow title="Open this path in the V2 file explorer">
          <IconButton
            component={Link}
            to={filesV2Url}
            size="small"
            aria-label="Explorer V2"
            sx={{
              p: '3px',
              px: '6px',
              gap: 0.4,
              borderRadius: '5px',
              color: 'rgba(0,0,0,0.62)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' },
              '& .MuiSvgIcon-root': { fontSize: 17 },
            }}
          >
            <FolderOpen />
            <Box
              component="span"
              sx={{ fontSize: '0.7rem', lineHeight: 1, whiteSpace: 'nowrap' }}
            >
              Explorer V2
            </Box>
          </IconButton>
        </Tooltip>
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
