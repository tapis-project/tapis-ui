/**
 * JobsNavV2 — the jobs sidebar on the FilterableObjectsListV2 kit (search,
 * Dolphin-style sort menu, compact rows, badges), replacing the old
 * FilterableObjectsList config.
 *
 * The problem this exists to solve: twenty near-identical generated names
 * (hello-world-test-20260901-…) drowning the column. Three answers at once —
 * names fold in the middle (prefix = which app, suffix = which run), status
 * lives entirely in the left icon, and one click groups by app so a burst of
 * runs collapses under a single header.
 *
 * Each fact appears exactly once. Status was reading twice (icon and chip) and
 * the age three times over (secondary line, sort label, age group header),
 * which is what made a row hard to scan. Now: icon = status, name, app, and
 * one right-hand label for whatever the active sort is ordering by.
 *
 * No badges at all. A red ! for an abnormal end rode alongside the status
 * icon, but JobStatusIcon already distinguishes those — a failure is a red
 * Cancel, a scheduler timeout a grey TimerOff — and the mark said the same
 * thing a second time.
 */
import React from 'react';
import { useHistory, useRouteMatch, useLocation } from 'react-router-dom';
import {
  FilterableObjectsListV2,
  QueryWrapper,
  JobStatusIcon,
  jobTerminalStatuses,
} from '@tapis/tapisui-common';
import { useCancelledJobs } from '../JobsLayoutToolbar/CancelledJobsContext';
import JobGlyph from '../JobGlyph';
import type { FilterConfig, SortOption } from '@tapis/tapisui-common';
import {
  Apps as AppsIcon,
  Dns,
  SortByAlpha,
  AccessAlarm,
  Work,
} from '@mui/icons-material';
import {
  AGE_BUCKETS,
  ageBucketLabel,
  getAgeBucket,
  midEllipsis,
  normTs,
  predicateFilter,
  timeAgo,
  timeRangeFilter,
} from 'app/_components/NavV2Kit/navKit';
import { useJobsSource } from '../jobsSource';
import { NavSearchScope, NavWindowBar } from 'app/_components/NavSpine';
import { setJobsSearch } from '../jobsSearch';
import styles from 'app/_components/PageShell/PageShell.module.scss';

const createdDesc = (a: any, b: any) =>
  normTs(b.created ?? '') - normTs(a.created ?? '');

const RUNNING = [
  'RUNNING',
  'QUEUED',
  'STAGING_INPUTS',
  'STAGING_JOB',
  'SUBMITTING_JOB',
  'PROCESSING_INPUTS',
  'ARCHIVING',
  'PENDING',
];

// Time on two fields, plus the three questions people actually open this nav
// with. A quick filter is just a predicate wearing the Filter shape.
const jobsFilterConfig: FilterConfig = {
  filterableFields: [
    {
      field: 'created',
      label: 'Created',
      filterType: 'timeRange',
      presets: [
        {
          id: 'quick-active',
          label: 'Active',
          filter: {
            id: 'quick-active',
            field: '_quick',
            type: 'quick',
            value: 'active',
            label: 'Active',
          },
        },
        {
          id: 'quick-failed',
          label: 'Failed',
          color: 'error',
          filter: {
            id: 'quick-failed',
            field: '_quick',
            type: 'quick',
            value: 'failed',
            label: 'Failed',
          },
        },
        {
          id: 'quick-abnormal',
          label: 'Ended abnormally',
          color: 'warning',
          filter: {
            id: 'quick-abnormal',
            field: '_quick',
            type: 'quick',
            value: 'abnormal',
            label: 'Ended abnormally',
          },
        },
      ],
    },
    { field: 'lastUpdated', label: 'Updated', filterType: 'timeRange' },
  ],
  filterFunctions: {
    created: timeRangeFilter((o) => o.created),
    lastUpdated: timeRangeFilter((o) => o.lastUpdated),
    _quick: predicateFilter({
      active: (o) => RUNNING.includes(o.status),
      failed: (o) => o.status === 'FAILED',
      abnormal: (o) => !!o.condition && o.condition !== 'NORMAL_COMPLETION',
    }),
  },
};

/**
 * The row's status glyph, aware of a cancel the servers have not caught up
 * with. Tapis cancels are asynchronous — the press queues a command and the
 * job genuinely keeps running until the scheduler acts — so the row keeps
 * the REAL status glyph (the same truth the card tells) and wears a small
 * amber dot for the pending request. Spinning the cancel glyph here read
 * as already-cancelled, which is exactly the overstatement this replaced.
 */
const RowStatusIcon: React.FC<{ object: any }> = ({ object }) => {
  const { cancelledUuids } = useCancelledJobs();
  const cancelling =
    cancelledUuids.has(object.uuid) &&
    !jobTerminalStatuses.includes(object.status);
  // JobGlyph owns both drawings and the pending-cancel dot this row used to
  // draw for itself — the preference decides which one the whole app wears
  return (
    <JobGlyph
      job={object}
      animation={object.status === 'RUNNING' ? 'rotate' : undefined}
      cancelling={cancelling}
    />
  );
};

/** Shared row shape for every grouping — one place decides how a job reads. */
const jobGroupBase = {
  primaryItemText: ({ object }: any) =>
    midEllipsis(object.name ?? object.uuid ?? '?'),
  secondaryItemText: ({ object }: any) => object.appId ?? '?',
  // The left slot carries status alone — colored, spinning while running, and
  // naming itself on hover. Nothing else on the row repeats it.
  groupItemIcon: ({ object }: any) => <RowStatusIcon object={object} />,
};

const JobsNavV2: React.FC = () => {
  const { jobs: sourceJobs, isLoading, error, spine } = useJobsSource();
  const { url } = useRouteMatch();
  const history = useHistory();
  // The nav mounts beside the routes, not inside them, so useParams is empty
  // here — the selected uuid comes from the pathname.
  const { pathname } = useLocation();
  const selectedUuid = pathname.split('/')[2] ?? '';

  const jobs = sourceJobs.map((j: any) => ({
    ...j,
    _alphaGroup: (j.name ?? '?')[0].toUpperCase(),
    _ageGroup: getAgeBucket(j.created),
    _ageGroupUpdated: getAgeBucket(j.lastUpdated),
    _appGroup: j.appId ?? '(unknown app)',
    _systemGroup: j.execSystemId ?? '(no exec system)',
  }));

  const open = (object: any) => history.push(`${url}/${object.uuid}`);

  return (
    // nav-fill hands the list a definite height, so its header (search +
    // ledger) pins and only the rows scroll. The first fetch renders the
    // nav's own chrome with skeleton rows, not QueryWrapper's spinner.
    <QueryWrapper
      isLoading={false}
      error={error}
      className={styles['nav-fill']}
    >
      <FilterableObjectsListV2
        objects={jobs}
        loading={isLoading}
        // the ledger rides in the pinned header, under the search row —
        // above the list it scrolled away with the first fifty rows
        belowToolbar={spine && <NavWindowBar noun="jobs" spine={spine} />}
        // jobs is the one service where loading more is NOT the answer:
        // verified against tacc.develop, a hidden job is dropped from
        // GET /jobs/list and from POST /jobs/search alike
        searchScope={() => (
          <NavSearchScope
            noun="jobs"
            spine={spine}
            unreachable="Hidden jobs are in no listing and no search: only their link opens one."
          />
        )}
        emptyMessage="No jobs yet. Launch an app."
        defaultField={undefined}
        defaultOnClickItem={open}
        includeAll={true}
        includeAllGroupLabel="All Jobs"
        includeAllSelectorLabel="all jobs"
        includeAllPrimaryItemText={jobGroupBase.primaryItemText}
        includeAllSecondaryItemText={jobGroupBase.secondaryItemText}
        defaultGroupIcon={<Work sx={{ fontSize: 16 }} />}
        filterable={true}
        filterConfig={jobsFilterConfig}
        groupable={true}
        orderable={true}
        compact={true}
        searchable={true}
        // one search for the page: this also filters the dashboard table
        onSearchChange={setJobsSearch}
        searchFields={(o: any) =>
          [o.name, o.appId, o.uuid, o.owner, o.execSystemId, o.status]
            .filter(Boolean)
            .join(' ')
        }
        selectedField={selectedUuid || undefined}
        isSelectedItem={({ object, selectedField }: any) =>
          object.uuid === selectedField
        }
        listItemIconStyle={{ minWidth: '26px' }}
        middleClickLink={(o: any) => (o.uuid ? `/#/jobs/${o.uuid}` : undefined)}
        sortOptions={
          [
            {
              id: 'created',
              label: 'Created',
              comparator: createdDesc,
              itemLabel: (o: any) => timeAgo(o.created),
              defaultOrder: 'ASC',
              groupField: '_ageGroup',
            },
            {
              id: 'lastUpdated',
              label: 'Last updated',
              comparator: (a: any, b: any) =>
                normTs(b.lastUpdated ?? '') - normTs(a.lastUpdated ?? ''),
              itemLabel: (o: any) => timeAgo(o.lastUpdated),
              defaultOrder: 'ASC',
              groupField: '_ageGroupUpdated',
            },
            {
              id: '_appGroup',
              label: 'App',
              // apps alphabetical, runs inside newest-first — the burst of
              // hello-world-test runs collapses under one header, newest on top
              comparator: (a: any, b: any) =>
                (a._appGroup ?? '').localeCompare(b._appGroup ?? '') ||
                createdDesc(a, b),
              itemLabel: (o: any) => timeAgo(o.created),
              defaultOrder: 'ASC',
              groupField: '_appGroup',
            },
            {
              id: '_systemGroup',
              label: 'System',
              comparator: (a: any, b: any) =>
                (a._systemGroup ?? '').localeCompare(b._systemGroup ?? '') ||
                createdDesc(a, b),
              itemLabel: (o: any) => timeAgo(o.created),
              defaultOrder: 'ASC',
              groupField: '_systemGroup',
            },
            {
              id: 'status',
              label: 'Status',
              comparator: (a: any, b: any) =>
                (a.status ?? '').localeCompare(b.status ?? '') ||
                createdDesc(a, b),
              itemLabel: (o: any) => timeAgo(o.created),
              defaultOrder: 'ASC',
              groupField: 'status',
              intraGroupOrder: 'alpha',
            },
            {
              id: 'name',
              label: 'Name (A–Z)',
              comparator: (a: any, b: any) =>
                (a.name ?? '').localeCompare(b.name ?? ''),
              itemLabel: (o: any) => timeAgo(o.created),
              defaultOrder: 'ASC',
              groupField: '_alphaGroup',
              intraGroupOrder: 'alpha',
            },
          ] as SortOption[]
        }
        defaultSortBy="created"
        defaultGroupsOn={true}
        groups={[
          {
            ...jobGroupBase,
            field: '_ageGroup',
            groupSelectorLabel: 'age',
            open: AGE_BUCKETS.map((b) => b.key),
            tooltip: ({ fieldValue }: any) => ageBucketLabel(fieldValue),
            groupLabel: ({ fieldValue }: any) => ageBucketLabel(fieldValue),
            groupIcon: () => <AccessAlarm sx={{ fontSize: 16 }} />,
            onClickItem: open,
          },
          {
            ...jobGroupBase,
            field: '_ageGroupUpdated',
            groupSelectorLabel: 'age (updated)',
            open: AGE_BUCKETS.map((b) => b.key),
            tooltip: ({ fieldValue }: any) => ageBucketLabel(fieldValue),
            groupLabel: ({ fieldValue }: any) => ageBucketLabel(fieldValue),
            groupIcon: () => <AccessAlarm sx={{ fontSize: 16 }} />,
            onClickItem: open,
          },
          {
            ...jobGroupBase,
            field: '_appGroup',
            groupSelectorLabel: 'app',
            open: ['*'],
            tooltip: ({ fieldValue }: any) => `Runs of ${fieldValue}`,
            groupLabel: ({ fieldValue }: any) => fieldValue,
            groupIcon: () => <AppsIcon sx={{ fontSize: 16 }} />,
            // inside an app group the app name is the header — the owner is
            // the fact that is still worth a line
            secondaryItemText: ({ object }: any) => object.owner ?? '',
            onClickItem: open,
          },
          {
            ...jobGroupBase,
            field: '_systemGroup',
            groupSelectorLabel: 'system',
            open: ['*'],
            tooltip: ({ fieldValue }: any) => `Jobs on ${fieldValue}`,
            groupLabel: ({ fieldValue }: any) => fieldValue,
            groupIcon: () => <Dns sx={{ fontSize: 16 }} />,
            onClickItem: open,
          },
          {
            ...jobGroupBase,
            field: 'status',
            groupSelectorLabel: 'status',
            open: ['RUNNING', 'FAILED', 'BLOCKED', 'QUEUED'],
            tooltip: ({ fieldValue }: any) => `Jobs in ${fieldValue}`,
            groupLabel: ({ fieldValue }: any) => fieldValue,
            groupIcon: ({ fieldValue }: any) => (
              <JobStatusIcon status={fieldValue} />
            ),
            onClickItem: open,
          },
          {
            ...jobGroupBase,
            field: '_alphaGroup',
            groupSelectorLabel: 'A–Z',
            open: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
              .split('')
              .concat(['_', '?']),
            tooltip: ({ fieldValue }: any) =>
              `Jobs starting with "${fieldValue}"`,
            groupLabel: ({ fieldValue }: any) => fieldValue,
            groupIcon: () => <SortByAlpha sx={{ fontSize: 16 }} />,
            onClickItem: open,
          },
        ]}
      />
    </QueryWrapper>
  );
};

export default JobsNavV2;
