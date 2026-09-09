/**
 * AppsNavV2 — the apps sidebar on the FilterableObjectsListV2 kit.
 *
 * The old grouping put "Public Apps" first and called everything else "My
 * Apps", sorted alphabetically — which buried the three apps you actually use
 * under a wall of shared demos. The new default sorts by LAST RUN (joined
 * from the shared jobs window), so the registry reads as "what I work with,
 * then everything else"; visibility, owner, job type and enabled remain one
 * click away, and every row shows when it last ran and how.
 */
import React from 'react';
import { useHistory, useRouteMatch, useLocation } from 'react-router-dom';
import { Apps } from '@tapis/tapis-typescript';
import { Apps as AppsHooks } from '@tapis/tapisui-hooks';
import { FilterableObjectsListV2, QueryWrapper } from '@tapis/tapisui-common';
import type {
  FilterConfig,
  ItemBadge,
  SortOption,
} from '@tapis/tapisui-common';
import { Chip } from '@mui/material';
import {
  Apps as AppsIcon,
  Public,
  Person,
  Lock,
  RestoreFromTrash,
  SortByAlpha,
  PlayCircleOutline,
  Category,
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
import { useJobsSource } from 'app/Jobs/_components/jobsSource';
import { useAppsSource } from '../appsSource';
import { NavSearchScope, NavWindowBar } from 'app/_components/NavSpine';
import { JobLite } from 'app/Jobs/_components/jobsData';
import { runContextByApp } from '../appsData';
import { setAppsSearch } from '../appsSearch';
import { deletedAppsPref, useDeletedAppsVisibility } from '../deletedAppsPref';
import DeletedBanner from 'app/_components/PageShell/DeletedBanner';
import ConfirmModal from 'app/_components/PageShell/ConfirmModal';
import styles from 'app/_components/PageShell/PageShell.module.scss';

// sorts after every real age bucket ('01'..'11')
const NEVER_RUN_KEY = '90';
const lastRunGroupLabel = (key: string) =>
  key === NEVER_RUN_KEY ? 'never run' : `ran ${ageBucketLabel(key)}`;

const RUNS_BUCKETS: Record<string, string> = {
  '1': '10+ runs',
  '2': '2–9 runs',
  '3': '1 run',
  '4': 'no runs',
};
const runsBucket = (n: number): string =>
  n >= 10 ? '1' : n >= 2 ? '2' : n === 1 ? '3' : '4';

// Last run is the axis this nav is built around, so it is the axis you filter
// on; 'updated' is the registry's own clock and stays available.
const appsFilterConfig: FilterConfig = {
  filterableFields: [
    {
      field: '_lastRun',
      label: 'Last run',
      filterType: 'timeRange',
      presets: [
        {
          id: 'quick-mine',
          label: 'Mine',
          filter: {
            id: 'quick-mine',
            field: '_quick',
            type: 'quick',
            value: 'mine',
            label: 'Mine',
          },
        },
        {
          id: 'quick-neverrun',
          label: 'Never run',
          filter: {
            id: 'quick-neverrun',
            field: '_quick',
            type: 'quick',
            value: 'neverRun',
            label: 'Never run',
          },
        },
        {
          id: 'quick-disabled',
          label: 'Disabled',
          color: 'error',
          filter: {
            id: 'quick-disabled',
            field: '_quick',
            type: 'quick',
            value: 'disabled',
            label: 'Disabled',
          },
        },
      ],
    },
    { field: 'updated', label: 'Updated', filterType: 'timeRange' },
  ],
  filterFunctions: {
    _lastRun: timeRangeFilter((o) => o._lastRun),
    updated: timeRangeFilter((o) => o.updated),
    _quick: predicateFilter({
      mine: (o) => !o.isPublic,
      neverRun: (o) => !o._lastRun,
      disabled: (o) => o.enabled === false,
    }),
  },
};

/** deleted rows keep their place in every sort and group — struck through
 *  and dimmed, wearing the trash badge — instead of living in a side panel */
const struck = (text: React.ReactNode) => (
  <span style={{ textDecoration: 'line-through', opacity: 0.55 }}>{text}</span>
);

const appGroupBase = {
  primaryItemText: ({ object }: any) =>
    object._deleted
      ? struck(midEllipsis(object.id ?? '?'))
      : midEllipsis(object.id ?? '?'),
  // Just the version. The default sort labels each row with its last run and
  // the group header names the bucket, so saying it a third time on the row
  // was the noisiest thing in the column.
  secondaryItemText: ({ object }: any) =>
    object._deleted ? struck(`v${object.version}`) : `v${object.version}`,
  // The left slot says whose app it is (and screams if it cannot run) —
  // the same apps glyph on every row said nothing.
  groupItemIcon: ({ object }: any) => {
    const icon =
      object.enabled === false ? (
        <Lock sx={{ fontSize: 15, color: '#c62828' }} />
      ) : object.isPublic ? (
        <Public sx={{ fontSize: 15, color: '#1565c0' }} />
      ) : (
        <Person sx={{ fontSize: 15, color: 'rgba(0,0,0,0.45)' }} />
      );
    return object._deleted ? (
      <span style={{ opacity: 0.45 }}>{icon}</span>
    ) : (
      icon
    );
  },
};

const AppsNavV2: React.FC = () => {
  const { apps: sourceApps, isLoading, error, spine } = useAppsSource();
  // Deleted apps ride the same list, the way deleted systems do. This is
  // the ONLY read that can see them — the single-app GET has no
  // showDeleted and answers APPAPI_NOT_FOUND — so without it a deleted app
  // was unreachable and `undelete` had no door, even though the service
  // implements it.
  const { data: deletedData } = AppsHooks.useDeletedApps();
  // the per-device choice: hidden means the rows stay out of the list
  // entirely — the banner (and Settings) is how they come back
  const deletedVisibility = useDeletedAppsVisibility();
  const deletedRows = (deletedData?.result ?? []) as any[];
  const deletedCount = deletedRows.length;
  // the trash badge's press: which app is being asked about, if any. A
  // 12px icon is easy to hit by accident, so it asks — but with the shared
  // ConfirmDialog rather than the systems page's reactstrap picker, which
  // exists only because it predates it
  const [restoring, setRestoring] = React.useState<string | undefined>(
    undefined
  );
  const { undelete, isLoading: restoringNow } = AppsHooks.useUndeleteApp();
  // The same jobs read the Jobs page shares — both engines dedupe on the
  // shared source, so the run join costs no extra request when both pages
  // have been visited.
  const jobsSource = useJobsSource();
  const { url } = useRouteMatch();
  const history = useHistory();
  // The nav mounts beside the routes, not inside them, so useParams is empty
  // here — the selected app comes from the pathname.
  const { pathname } = useLocation();
  const selectedAppId = decodeURIComponent(pathname.split('/')[2] ?? '');

  const runCtx = runContextByApp(jobsSource.jobs as JobLite[]);

  // the deleted listing outvotes the window: right after a delete the
  // window can still hold the row alive (its refetch is in flight), and
  // for that beat the list showed the app twice — once living, once
  // struck. The live copy yields whenever the deleted list has the id.
  const deletedIds = new Set(deletedRows.map((a) => a.id));
  const apps = [
    ...sourceApps.filter((a: any) => !deletedIds.has(a.id)),
    ...(deletedVisibility === 'show'
      ? deletedRows.map((a) => ({ ...a, _deleted: true }))
      : []),
  ].map((a: any) => {
    const ctx = runCtx.get(a.id);
    const runs = ctx?.total ?? 0;
    return {
      ...a,
      _lastRun: ctx?.last,
      _lastStatus: ctx?.lastStatus,
      _runs: runs,
      _running: ctx?.running ?? 0,
      // one group field per sort — grouping follows the active sort
      // (Dolphin-style lockstep), so every sort needs its natural buckets
      _lastRunGroup: ctx?.last ? getAgeBucket(ctx.last) : NEVER_RUN_KEY,
      _runsGroup: runsBucket(runs),
      _ageGroupUpdated: getAgeBucket(a.updated),
      _visGroup: a.isPublic ? 'public' : 'mine',
      _typeGroup: a.jobType ?? '(no type)',
      _ownerGroup: a.owner ?? '(unknown)',
      _enabledGroup: a.enabled ? 'enabled' : 'disabled',
      _alphaGroup: (a.id ?? '?')[0].toUpperCase(),
    };
  });

  const open = (object: any) =>
    history.push(`${url}/${object.id}/${object.version}`);

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
        objects={apps}
        loading={isLoading}
        belowToolbar={
          <>
            {spine && <NavWindowBar noun="apps" spine={spine} />}
            {/* right under the ledger: the deleted count and its flip */}
            <DeletedBanner
              count={deletedCount}
              noun="app"
              pref={deletedAppsPref}
            />
          </>
        }
        searchScope={() => (
          <NavSearchScope
            noun="apps"
            spine={spine}
            byPreference={
              deletedCount > 0 &&
              (deletedVisibility === 'show'
                ? `Includes the ${deletedCount} deleted.`
                : `Not the ${deletedCount} deleted, while they are hidden.`)
            }
          />
        )}
        emptyMessage="No apps visible. They appear once the tenant registers some."
        defaultField={undefined}
        defaultOnClickItem={open}
        includeAll={true}
        includeAllGroupLabel="All Apps"
        includeAllSelectorLabel="all apps"
        includeAllPrimaryItemText={appGroupBase.primaryItemText}
        includeAllSecondaryItemText={appGroupBase.secondaryItemText}
        defaultGroupIcon={<AppsIcon sx={{ fontSize: 16 }} />}
        filterable={true}
        filterConfig={appsFilterConfig}
        groupable={true}
        orderable={true}
        compact={true}
        searchable={true}
        // one search for the page: this also filters the landing table
        onSearchChange={setAppsSearch}
        searchFields={(o: any) =>
          [o.id, o.description, o.owner, o.jobType, ...(o.tags ?? [])]
            .filter(Boolean)
            .join(' ')
        }
        selectedField={selectedAppId || undefined}
        isSelectedItem={({ object, selectedField }: any) =>
          object.id === selectedField
        }
        listItemIconStyle={{ minWidth: '26px' }}
        middleClickLink={(o: any) =>
          o.id ? `/#/apps/${o.id}/${o.version}` : undefined
        }
        itemBadges={(o: any) => {
          const badges: ItemBadge[] = [];
          // ONE bottom slot. A deleted row's badge IS its restore door:
          // gray trash at rest, never green, press to bring it back. It
          // returns early, so a deleted app never also wears its run count
          // — the only question about it is whether you want it back.
          if (o._deleted) {
            badges.push({
              position: 'bottom-right',
              content: (
                <RestoreFromTrash
                  sx={{
                    fontSize: 12,
                    color: 'text.disabled',
                    cursor: 'pointer',
                    '&:hover': { color: 'text.primary' },
                  }}
                  onClick={(event: React.MouseEvent) => {
                    event.stopPropagation();
                    setRestoring(o.id);
                  }}
                />
              ),
              tooltip: `Deleted. Press the trash to restore ${o.id}`,
            });
            return badges;
          }
          if (o._runs > 0) {
            badges.push({
              position: 'top-right',
              content: (
                <Chip
                  label={o._running > 0 ? `${o._runs} · running` : o._runs}
                  size="small"
                  sx={{
                    height: 16,
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    backgroundColor: o._running > 0 ? '#e8f5e9' : '#eceff1',
                    color: o._running > 0 ? '#2e7d32' : '#37474f',
                    borderRadius: '4px',
                    '& .MuiChip-label': { px: 0.5 },
                  }}
                />
              ),
              tooltip: `${o._runs} run${
                o._runs === 1 ? '' : 's'
              } in the jobs window${
                o._lastStatus ? `, last: ${o._lastStatus}` : ''
              }`,
            });
          }
          return badges;
        }}
        sortOptions={
          [
            {
              id: '_lastRun',
              label: 'Last run',
              // never-run apps sink to the bottom instead of interleaving
              comparator: (a: any, b: any) =>
                normTs(b._lastRun ?? 0) - normTs(a._lastRun ?? 0),
              itemLabel: (o: any) =>
                o._lastRun ? timeAgo(o._lastRun) : 'never run',
              defaultOrder: 'ASC',
              groupField: '_lastRunGroup',
            },
            {
              id: '_runs',
              label: '# Runs',
              comparator: (a: any, b: any) =>
                b._runs - a._runs ||
                normTs(b._lastRun ?? 0) - normTs(a._lastRun ?? 0),
              itemLabel: (o: any) => `${o._runs} runs`,
              defaultOrder: 'ASC',
              groupField: '_runsGroup',
            },
            {
              id: '_visGroup',
              label: 'Visibility',
              // mine first, then public; fresh activity leads inside each
              comparator: (a: any, b: any) =>
                (a._visGroup ?? '').localeCompare(b._visGroup ?? '') ||
                normTs(b._lastRun ?? 0) - normTs(a._lastRun ?? 0),
              defaultOrder: 'ASC',
              groupField: '_visGroup',
            },
            {
              id: '_ownerGroup',
              label: 'Owner',
              comparator: (a: any, b: any) =>
                (a._ownerGroup ?? '').localeCompare(b._ownerGroup ?? '') ||
                (a.id ?? '').localeCompare(b.id ?? ''),
              defaultOrder: 'ASC',
              groupField: '_ownerGroup',
              intraGroupOrder: 'alpha',
            },
            {
              id: '_typeGroup',
              label: 'Job type',
              comparator: (a: any, b: any) =>
                (a._typeGroup ?? '').localeCompare(b._typeGroup ?? '') ||
                (a.id ?? '').localeCompare(b.id ?? ''),
              defaultOrder: 'ASC',
              groupField: '_typeGroup',
              intraGroupOrder: 'alpha',
            },
            {
              id: '_enabledGroup',
              label: 'Enabled',
              comparator: (a: any, b: any) =>
                (a._enabledGroup ?? '').localeCompare(b._enabledGroup ?? '') ||
                (a.id ?? '').localeCompare(b.id ?? ''),
              defaultOrder: 'ASC',
              groupField: '_enabledGroup',
              intraGroupOrder: 'alpha',
            },
            {
              id: 'id',
              label: 'Name (A–Z)',
              comparator: (a: any, b: any) =>
                (a.id ?? '').localeCompare(b.id ?? ''),
              defaultOrder: 'ASC',
              groupField: '_alphaGroup',
              intraGroupOrder: 'alpha',
            },
            {
              id: 'updated',
              label: 'Updated',
              comparator: (a: any, b: any) =>
                normTs(b.updated ?? 0) - normTs(a.updated ?? 0),
              itemLabel: (o: any) => timeAgo(o.updated),
              defaultOrder: 'ASC',
              groupField: '_ageGroupUpdated',
            },
          ] as SortOption[]
        }
        defaultSortBy="_lastRun"
        defaultGroupsOn={true}
        groups={[
          {
            ...appGroupBase,
            field: '_lastRunGroup',
            groupSelectorLabel: 'last run',
            open: AGE_BUCKETS.map((b) => b.key).concat([NEVER_RUN_KEY]),
            tooltip: ({ fieldValue }: any) => lastRunGroupLabel(fieldValue),
            groupLabel: ({ fieldValue }: any) => lastRunGroupLabel(fieldValue),
            groupIcon: () => <PlayCircleOutline sx={{ fontSize: 16 }} />,
            onClickItem: open,
          },
          {
            ...appGroupBase,
            field: '_runsGroup',
            groupSelectorLabel: 'runs',
            open: ['1', '2', '3', '4'],
            tooltip: ({ fieldValue }: any) =>
              `${RUNS_BUCKETS[fieldValue] ?? fieldValue} in the jobs window`,
            groupLabel: ({ fieldValue }: any) =>
              RUNS_BUCKETS[fieldValue] ?? fieldValue,
            groupIcon: () => <PlayCircleOutline sx={{ fontSize: 16 }} />,
            onClickItem: open,
          },
          {
            ...appGroupBase,
            field: '_ageGroupUpdated',
            groupSelectorLabel: 'updated',
            open: AGE_BUCKETS.map((b) => b.key),
            tooltip: ({ fieldValue }: any) => ageBucketLabel(fieldValue),
            groupLabel: ({ fieldValue }: any) => ageBucketLabel(fieldValue),
            groupIcon: () => <Category sx={{ fontSize: 16 }} />,
            onClickItem: open,
          },
          {
            ...appGroupBase,
            field: '_visGroup',
            groupSelectorLabel: 'visibility',
            open: ['mine', 'public'],
            tooltip: ({ fieldValue }: any) =>
              fieldValue === 'public'
                ? 'Shared with the whole tenant'
                : 'Yours, and apps shared directly with you',
            groupLabel: ({ fieldValue }: any) =>
              fieldValue === 'public' ? 'Public' : 'Mine & shared',
            groupIcon: ({ fieldValue }: any) =>
              fieldValue === 'public' ? (
                <Public sx={{ fontSize: 16 }} />
              ) : (
                <Person sx={{ fontSize: 16 }} />
              ),
            onClickItem: open,
          },
          {
            ...appGroupBase,
            field: '_ownerGroup',
            groupSelectorLabel: 'owner',
            open: ['*'],
            tooltip: ({ fieldValue }: any) => `Apps owned by ${fieldValue}`,
            groupLabel: ({ fieldValue }: any) => fieldValue,
            groupIcon: () => <Person sx={{ fontSize: 16 }} />,
            onClickItem: open,
          },
          {
            ...appGroupBase,
            field: '_typeGroup',
            groupSelectorLabel: 'job type',
            open: ['*'],
            tooltip: ({ fieldValue }: any) => `${fieldValue} apps`,
            groupLabel: ({ fieldValue }: any) => fieldValue,
            groupIcon: () => <Category sx={{ fontSize: 16 }} />,
            onClickItem: open,
          },
          {
            ...appGroupBase,
            field: '_enabledGroup',
            groupSelectorLabel: 'enabled',
            open: ['enabled', 'disabled'],
            tooltip: ({ fieldValue }: any) =>
              fieldValue === 'enabled'
                ? 'Runnable now'
                : 'Disabled apps cannot be run',
            groupLabel: ({ fieldValue }: any) => fieldValue,
            groupIcon: ({ fieldValue }: any) =>
              fieldValue === 'enabled' ? (
                <PlayCircleOutline sx={{ fontSize: 16, color: '#2e7d32' }} />
              ) : (
                <Lock sx={{ fontSize: 16, color: '#c62828' }} />
              ),
            onClickItem: open,
          },
          {
            ...appGroupBase,
            field: '_alphaGroup',
            groupSelectorLabel: 'A–Z',
            open: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
              .split('')
              .concat(['_', '?']),
            tooltip: ({ fieldValue }: any) =>
              `Apps starting with "${fieldValue}"`,
            groupLabel: ({ fieldValue }: any) => fieldValue,
            groupIcon: () => <SortByAlpha sx={{ fontSize: 16 }} />,
            onClickItem: open,
          },
        ]}
      />
      <ConfirmModal
        open={!!restoring}
        title="Restore app"
        confirmText={restoringNow ? 'Restoring…' : 'Restore'}
        busy={restoringNow}
        onClose={() => setRestoring(undefined)}
        onConfirm={() => {
          const appId = restoring!;
          setRestoring(undefined);
          // invalidateApp (see appCache) refreshes the deleted listing too,
          // so the row flips from struck to live on its own
          undelete({ appId });
        }}
      >
        <b>{restoring}</b> comes back into the listings exactly as it was. Its
        versions, its permissions and its history are all still there. Deleting
        an app never destroyed any of it.
      </ConfirmModal>
    </QueryWrapper>
  );
};

export default AppsNavV2;
