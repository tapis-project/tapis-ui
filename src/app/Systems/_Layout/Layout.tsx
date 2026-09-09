import React, { useState, useSyncExternalStore } from 'react';
import { Stack, Chip } from '@mui/material';
import { useQueryClient } from 'react-query';
import styles from 'app/_components/PageShell/PageShell.module.scss';
import { SystemsHelp } from 'app/_components/Help';
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
import PodBarButton from 'app/Pods/_utils/PodBarButton';
import { useSystemsSource } from 'app/Files/_components/systemsSource';
import SystemsPageNav from '../_components/SystemsPageNav/SystemsPageNav';
import NewSystemDialog from '../_components/SystemToolbar/NewSystemDialog';
import { Router } from '../_Router';

/**
 * Systems page on the pods shell — header with live counts and the create
 * door, V2 nav beside the working pane (landing dashboard at /systems, the
 * fact-card detail at /systems/:id). One windowed systems read — shared
 * with the Files page — feeds all of it.
 */
const Layout: React.FC = () => {
  const wide = useSyncExternalStore(subscribePageWide, getPageWide);
  const boundedWidth = useSyncExternalStore(subscribePageWide, getBoundedWidth);
  const queryClient = useQueryClient();
  const source = useSystemsSource();
  const systems = source.systems;
  const publicCount = systems.filter((s) => s.isPublic).length;
  const [creating, setCreating] = useState(false);

  return (
    <div className={styles['page-root']}>
      <div className={styles['page-header']}>
        <PageHeaderRow>
          <Stack direction="row" spacing={1} alignItems="center">
            <PageHeaderTitle to="/systems">Systems</PageHeaderTitle>
            <SystemsHelp />
            <InfoDetailToggle />
            <PageWidthToggle />
            <Chip
              size="small"
              label={`${systems.length}${
                source.spine?.meta.truncated ? '+' : ''
              } systems · ${publicCount} public`}
              sx={{ height: 18, fontSize: '0.65rem', borderRadius: '4px' }}
            />
          </Stack>
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{ flexShrink: 0, flexWrap: 'nowrap' }}
          >
            <PodBarButton
              onClick={() => setCreating(true)}
              style={{ padding: '0.18em 0.7em' }}
            >
              New system
            </PodBarButton>
            <PodBarButton
              loading={source.isLoading}
              onClick={() => {
                queryClient.invalidateQueries('systems/list');
                queryClient.invalidateQueries('systems/listWindow');
              }}
              style={{ padding: '0.18em 0.7em' }}
            >
              Refresh
            </PodBarButton>
          </Stack>
        </PageHeaderRow>
      </div>
      <div className={styles['content-row']}>
        <div className={styles['nav']}>
          <SystemsPageNav />
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
      <NewSystemDialog open={creating} toggle={() => setCreating(false)} />
    </div>
  );
};

export default Layout;
