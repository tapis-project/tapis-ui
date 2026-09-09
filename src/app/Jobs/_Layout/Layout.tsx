import React, { useSyncExternalStore } from 'react';
import { Stack, Chip } from '@mui/material';
import { useQueryClient } from 'react-query';
import { useJobsSource } from '../_components/jobsSource';
import PodBarButton from 'app/Pods/_utils/PodBarButton';
import { JobsHelp } from 'app/_components/Help';
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
import styles from 'app/_components/PageShell/PageShell.module.scss';
import JobsNavV2 from '../_components/JobsNav/JobsNavV2';
import { Router } from '../_Router';
import { countsByClass } from '../_components/jobsData';

/**
 * Jobs page on the pods shell: page-header (title · live counts · refresh),
 * then nav (JobsNavV2) beside the working pane (dashboard at /jobs, job
 * detail at /jobs/:uuid). One jobs-list read feeds all of it.
 */
const Layout: React.FC = () => {
  const wide = useSyncExternalStore(subscribePageWide, getPageWide);
  const boundedWidth = useSyncExternalStore(subscribePageWide, getBoundedWidth);
  const queryClient = useQueryClient();
  const source = useJobsSource();
  const { isFetching } = source;
  const jobs = source.jobs;
  const counts = countsByClass(jobs as never);

  return (
    <div className={styles['page-root']}>
      <div className={styles['page-header']}>
        <PageHeaderRow>
          <Stack direction="row" spacing={1} alignItems="center">
            <PageHeaderTitle to="/jobs">Jobs</PageHeaderTitle>
            <JobsHelp />
            <InfoDetailToggle />
            <PageWidthToggle />
            <Chip
              size="small"
              label={`${jobs.length}${
                source.spine?.meta.truncated ? '+' : ''
              } in window`}
              sx={{ height: 18, fontSize: '0.65rem', borderRadius: '4px' }}
            />
            {counts.running > 0 && (
              <Chip
                size="small"
                label={`${counts.running} running`}
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  borderRadius: '4px',
                  bgcolor: '#e8f5e9',
                  color: '#2e7d32',
                  fontWeight: 600,
                }}
              />
            )}
          </Stack>
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{ flexShrink: 0, flexWrap: 'nowrap' }}
          >
            <PodBarButton
              loading={isFetching}
              onClick={() => {
                queryClient.invalidateQueries('jobs/list');
                queryClient.invalidateQueries('jobs/listWindow');
                // the open detail card refreshes with the press too — it
                // used to sit on its own backed-off poll while the nav
                // moved on to RUNNING
                queryClient.invalidateQueries('jobs/details');
              }}
              // the header's tallest element was this button's padding, which
              // set the bar's height on its own — trimmed to the chips' 18px
              style={{ padding: '0.18em 0.7em' }}
            >
              Refresh
            </PodBarButton>
          </Stack>
        </PageHeaderRow>
      </div>
      <div className={styles['content-row']}>
        <div className={styles['nav']}>
          <JobsNavV2 />
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
