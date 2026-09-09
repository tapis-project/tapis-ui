import React, { useSyncExternalStore } from 'react';
import { Stack, Chip } from '@mui/material';
import styles from 'app/_components/PageShell/PageShell.module.scss';
import AppsHelp from 'app/_components/Help/AppsHelp';
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
import AppsNavV2 from '../_components/AppsNav/AppsNavV2';
import { useAppsSource } from '../_components/appsSource';
import { Router } from '../_Router';

/**
 * Apps page on the pods shell — header with live counts, V2 nav beside the
 * working pane (app detail, or the pick-an-app landing).
 */
const Layout: React.FC = () => {
  const wide = useSyncExternalStore(subscribePageWide, getPageWide);
  const boundedWidth = useSyncExternalStore(subscribePageWide, getBoundedWidth);
  // the nav's own read — this header used to make a second, differently
  // shaped list request for two numbers
  const source = useAppsSource();
  const apps = source.apps;
  const publicCount = apps.filter((a: any) => a.isPublic).length;

  return (
    <div className={styles['page-root']}>
      <div className={styles['page-header']}>
        <PageHeaderRow>
          <Stack direction="row" spacing={1} alignItems="center">
            <PageHeaderTitle to="/apps">Apps</PageHeaderTitle>
            <AppsHelp />
            <InfoDetailToggle />
            <PageWidthToggle />
            <Chip
              size="small"
              label={`${apps.length}${
                source.spine?.meta.truncated ? '+' : ''
              } apps · ${publicCount} public`}
              sx={{ height: 18, fontSize: '0.65rem', borderRadius: '4px' }}
            />
          </Stack>
        </PageHeaderRow>
      </div>
      <div className={styles['content-row']}>
        <div className={styles['nav']}>
          <AppsNavV2 />
        </div>
        <div className={styles['right-pane']}>
          <div className={styles['work-content']}>
            <div
              className={styles['container']}
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
  );
};

export default Layout;
