import React, { useEffect, useSyncExternalStore } from 'react';
import { Stack, Chip, Tooltip, IconButton, Box } from '@mui/material';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { FolderOpen } from '@mui/icons-material';
import styles from 'app/_components/PageShell/PageShell.module.scss';
import FilesHelp from 'app/_components/Help/FilesHelp';
import PageHeaderTitle, {
  InfoDetailToggle,
  PageHeaderRow,
  PageWidthToggle,
} from 'app/_components/PageShell/PageHeaderTitle';
import {
  getBoundedWidth,
  getPageWide,
  subscribePageWide,
} from 'app/_components/PageShell/pageWidth';
import { explorerFit } from 'app/_components/PageShell/viewPrefs';
import SystemsNavV2 from '../_components/SystemsNav/SystemsNavV2';
import ToolbarV2 from '../_components/Toolbar/ToolbarV2';
import { FilesProvider } from '../_components/FilesContext';
import { recordRecentSystem } from '../_components/recentSystems';
import { useSystemsSource } from '../_components/systemsSource';
import { Router } from '../_Router';
import FilesV2 from '../V2';

/**
 * Files page on the pods shell — header with the file-op toolbar for the
 * system being browsed, V2 systems nav beside the listing pane. Opening a
 * system stamps the per-device recency store that drives the nav's default
 * sort.
 */
const Layout: React.FC = () => {
  const wide = useSyncExternalStore(subscribePageWide, getPageWide);
  const boundedWidth = useSyncExternalStore(subscribePageWide, getBoundedWidth);
  const history = useHistory();
  const { pathname, search, hash } = useLocation();
  const systemId = decodeURIComponent(pathname.split('/')[2] ?? '');
  // dev's file explorer V2 lives under /files/v2 and takes the whole pane.
  // Kept through this rewrite: the shell below is the V1 chrome, and V2
  // brings its own.
  const isV2 = pathname === '/files/v2' || pathname.startsWith('/files/v2/');
  const filesV2Url = `${pathname.replace(
    /^\/files(?=\/|$)/,
    '/files/v2'
  )}${search}${hash}`;
  const currentPath = pathname.split('/').splice(3).join('/');
  // the nav's own read — no second fetch just for a header count
  const source = useSystemsSource();
  const systems = source.systems;

  // On a listing, the table owns the scrolling — see .container-fill — but
  // only while the explorer preference says pinned. Flow lets the listing
  // grow and the page scroll past it, like any other content. The overview
  // is ordinary page content either way. (The hook is called before the
  // && on purpose: short-circuiting a hook call is a hook-order crash.)
  const pinnedExplorer = explorerFit.use() === 'pinned';
  const browsing = Boolean(systemId) && pinnedExplorer;

  useEffect(() => {
    recordRecentSystem(systemId || undefined);
  }, [systemId]);

  return (
    <FilesProvider>
      {/* dev's V2 explorer owns the whole pane and brings its own chrome */}
      {isV2 ? (
        <div style={{ height: '100%', minHeight: 0, overflow: 'hidden' }}>
          <FilesV2 />
        </div>
      ) : (
        <div className={styles['page-root']}>
          <div className={styles['page-header']}>
            <PageHeaderRow>
              <Stack direction="row" spacing={1} alignItems="center">
                <PageHeaderTitle to="/files">Files</PageHeaderTitle>
                <FilesHelp />
                <InfoDetailToggle />
                <PageWidthToggle />
                <Tooltip
                  title={
                    systemId
                      ? "Open this system's page — definition, credentials, sharing"
                      : ''
                  }
                  arrow
                >
                  <Chip
                    size="small"
                    label={
                      systemId
                        ? systemId
                        : `${systems.length}${
                            source.spine?.meta.truncated ? '+' : ''
                          } system${systems.length === 1 ? '' : 's'}`
                    }
                    onClick={
                      systemId
                        ? () => history.push(`/systems/${systemId}`)
                        : undefined
                    }
                    sx={{
                      height: 18,
                      fontSize: '0.65rem',
                      borderRadius: '4px',
                      fontFamily: systemId ? 'monospace' : undefined,
                      ...(systemId && { cursor: 'pointer' }),
                    }}
                  />
                </Tooltip>
              </Stack>
              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                sx={{ flexShrink: 0, flexWrap: 'nowrap' }}
              >
                {/* The way into the V2 explorer, carrying the same weight as
                    the toolbar's rail buttons beside it. */}
                <Tooltip title="Open this path in the V2 file explorer" arrow>
                  <IconButton
                    component={Link}
                    to={filesV2Url}
                    size="small"
                    aria-label="Explorer V2"
                    sx={{
                      flexShrink: 0,
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
                      sx={{
                        fontSize: '0.7rem',
                        lineHeight: 1,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Explorer V2
                    </Box>
                  </IconButton>
                </Tooltip>
                {systemId && (
                  <ToolbarV2 systemId={systemId} currentPath={currentPath} />
                )}
              </Stack>
            </PageHeaderRow>
          </div>
          <div className={styles['content-row']}>
            <div className={styles['nav']}>
              <SystemsNavV2 />
            </div>
            <div className={styles['right-pane']}>
              <div
                className={`${styles['work-content']} ${
                  browsing ? styles['work-content-fixed'] : ''
                }`}
              >
                <div
                  className={`${styles['container']} ${
                    browsing ? styles['container-fill'] : ''
                  }`}
                  // dense tables read badly at ultrawide line lengths, so the pane
                  // is capped until the header's width toggle says otherwise
                  style={{ maxWidth: wide ? 'none' : boundedWidth }}
                >
                  <Router />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </FilesProvider>
  );
};

export default Layout;
