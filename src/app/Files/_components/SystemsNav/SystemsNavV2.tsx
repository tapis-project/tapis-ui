/**
 * SystemsNavV2 — the Files sidebar on the FilterableObjectsListV2 kit.
 *
 * The old nav was a bare list of ids with folder icons — no search, no order,
 * no way to tell a LINUX host from an S3 bucket or a system you can't even
 * authenticate to. Rows now carry host + type, credential and disabled
 * warnings, and the default sort is "recently browsed" (a local, per-device
 * signal — recorded every time you open a system here), so the systems you
 * actually work in stay on top. Sorts and groups walk in lockstep: each sort
 * brings its natural grouping.
 */
import React from 'react';
import { useHistory, useRouteMatch, useLocation } from 'react-router-dom';
import { NavSearchScope, NavWindowBar } from 'app/_components/NavSpine';
import { FilterableObjectsListV2, QueryWrapper } from '@tapis/tapisui-common';
import type {
  FilterConfig,
  ItemBadge,
  SortOption,
} from '@tapis/tapisui-common';
import { Chip } from '@mui/material';
import {
  Dns,
  Public,
  Person,
  Lock,
  SortByAlpha,
  History,
  Storage,
  Category,
  Key,
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
import { recentSystemsMap } from '../recentSystems';
import { useSystemsSource } from '../systemsSource';
import { setFilesSearch } from '../filesSearch';
import styles from 'app/_components/PageShell/PageShell.module.scss';

// sorts after every real age bucket ('01'..'11')
const NEVER_KEY = '90';
const recentGroupLabel = (key: string) =>
  key === NEVER_KEY ? 'not browsed here' : `browsed ${ageBucketLabel(key)}`;

// the tile moved to the shared kit when the /systems nav grew one too
import { SystemTypeTile as TypeTile } from 'app/_components/NavV2Kit/SystemTypeTile';

// Systems change slowly, so 'when did I last open it' is the useful clock —
// it comes from this browser's own history, not the API.
const systemsFilterConfig: FilterConfig = {
  filterableFields: [
    {
      field: '_lastBrowsed',
      label: 'Last browsed',
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
          id: 'quick-public',
          label: 'Public',
          filter: {
            id: 'quick-public',
            field: '_quick',
            type: 'quick',
            value: 'public',
            label: 'Public',
          },
        },
        {
          id: 'quick-execable',
          label: 'Runs jobs',
          filter: {
            id: 'quick-execable',
            field: '_quick',
            type: 'quick',
            value: 'execable',
            label: 'Runs jobs',
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
    { field: 'created', label: 'Created', filterType: 'timeRange' },
  ],
  filterFunctions: {
    _lastBrowsed: timeRangeFilter((o) => o._lastBrowsed),
    updated: timeRangeFilter((o) => o.updated),
    created: timeRangeFilter((o) => o.created),
    _quick: predicateFilter({
      mine: (o) => !o.isPublic,
      public: (o) => !!o.isPublic,
      execable: (o) => !!o.canExec,
      disabled: (o) => o.enabled === false,
    }),
  },
};

const sysGroupBase = {
  primaryItemText: ({ object }: any) => midEllipsis(object.id ?? '?'),
  secondaryItemText: ({ object }: any) =>
    object.host ? midEllipsis(object.host, 30) : object.systemType ?? '',
  groupItemIcon: ({ object }: any) => <TypeTile type={object.systemType} />,
};

const SystemsNavV2: React.FC = () => {
  // The page's one systems read — engine-aware (window vs classic) and
  // shared with the landing table and the header count.
  const {
    systems: sourceSystems,
    isLoading,
    error,
    spine,
  } = useSystemsSource();

  const { url } = useRouteMatch();
  const history = useHistory();
  // The nav mounts beside the routes, not inside them, so useParams is empty
  // here — the selected id comes from the pathname.
  const { pathname } = useLocation();
  const selectedSystemId = decodeURIComponent(pathname.split('/')[2] ?? '');

  const recent = recentSystemsMap();

  const systems = sourceSystems.map((s: any) => {
    const lastBrowsed = recent.get(s.id);
    return {
      ...s,
      _lastBrowsed: lastBrowsed,
      _recentGroup: lastBrowsed ? getAgeBucket(lastBrowsed) : NEVER_KEY,
      _typeGroup: s.systemType ?? '(unknown)',
      _visGroup: s.isPublic ? 'public' : 'mine',
      _ownerGroup: s.owner ?? '(unknown)',
      _authGroup: s.defaultAuthnMethod ?? '(unknown)',
      _enabledGroup: s.enabled ? 'enabled' : 'disabled',
      _ageGroupUpdated: getAgeBucket(s.updated),
      _alphaGroup: (s.id ?? '?')[0].toUpperCase(),
    };
  });

  const open = (object: any) => history.push(`${url}/${object.id}`);

  return (
    // nav-fill hands the list a definite height, so its header (search +
    // ledger) pins and only the rows scroll. The first fetch renders the
    // nav's own chrome with skeleton rows, not QueryWrapper's spinner.
    <QueryWrapper
      isLoading={false}
      error={(error as Error) ?? null}
      className={styles['nav-fill']}
    >
      <FilterableObjectsListV2
        objects={systems}
        loading={isLoading}
        belowToolbar={spine && <NavWindowBar noun="systems" spine={spine} />}
        searchScope={() => <NavSearchScope noun="systems" spine={spine} />}
        emptyMessage="No systems visible. Register one, or ask for a share."
        defaultField={undefined}
        defaultOnClickItem={open}
        includeAll={true}
        includeAllGroupLabel="All Systems"
        includeAllSelectorLabel="all systems"
        includeAllPrimaryItemText={sysGroupBase.primaryItemText}
        includeAllSecondaryItemText={sysGroupBase.secondaryItemText}
        defaultGroupIcon={<Storage sx={{ fontSize: 16 }} />}
        filterable={true}
        filterConfig={systemsFilterConfig}
        groupable={true}
        orderable={true}
        compact={true}
        searchable={true}
        onSearchChange={setFilesSearch}
        searchFields={(o: any) =>
          [
            o.id,
            o.host,
            o.description,
            o.owner,
            o.systemType,
            ...(o.tags ?? []),
          ]
            .filter(Boolean)
            .join(' ')
        }
        selectedField={selectedSystemId || undefined}
        isSelectedItem={({ object, selectedField }: any) =>
          object.id === selectedField
        }
        listItemIconStyle={{ minWidth: '26px' }}
        middleClickLink={(o: any) => (o.id ? `/#/files/${o.id}` : undefined)}
        itemBadges={(o: any) => {
          const badges: ItemBadge[] = [];
          // ONE bottom slot, priority: disabled beats the public globe.
          // hasCredentials deliberately shows NOTHING here — the flag is
          // computed for the requesting user, but a static-effectiveUserId
          // system authenticates as another login user whose credentials the
          // flag does not see, so "no creds" can be flat wrong. The truth is
          // one click away (the listing itself).
          if (o.enabled === false) {
            badges.push({
              position: 'bottom-right',
              content: <Lock sx={{ fontSize: 11, color: '#c62828' }} />,
              tooltip: 'Disabled: listings will fail until re-enabled',
            });
          } else if (o.isPublic) {
            badges.push({
              position: 'bottom-right',
              content: <Public sx={{ fontSize: 11, color: '#1565c0' }} />,
              tooltip: 'Public: visible to the whole tenant',
            });
          }
          return badges;
        }}
        sortOptions={
          [
            {
              id: '_lastBrowsed',
              label: 'Recently browsed',
              comparator: (a: any, b: any) =>
                (b._lastBrowsed ?? 0) - (a._lastBrowsed ?? 0),
              itemLabel: (o: any) =>
                o._lastBrowsed ? timeAgo(o._lastBrowsed) : 'not yet',
              defaultOrder: 'ASC',
              groupField: '_recentGroup',
            },
            {
              id: '_typeGroup',
              label: 'Type',
              comparator: (a: any, b: any) =>
                (a._typeGroup ?? '').localeCompare(b._typeGroup ?? '') ||
                (a.id ?? '').localeCompare(b.id ?? ''),
              defaultOrder: 'ASC',
              groupField: '_typeGroup',
              intraGroupOrder: 'alpha',
            },
            {
              id: '_visGroup',
              label: 'Visibility',
              comparator: (a: any, b: any) =>
                (a._visGroup ?? '').localeCompare(b._visGroup ?? '') ||
                (a.id ?? '').localeCompare(b.id ?? ''),
              defaultOrder: 'ASC',
              groupField: '_visGroup',
              intraGroupOrder: 'alpha',
            },
            {
              id: '_authGroup',
              label: 'Auth method',
              comparator: (a: any, b: any) =>
                (a._authGroup ?? '').localeCompare(b._authGroup ?? '') ||
                (a.id ?? '').localeCompare(b.id ?? ''),
              defaultOrder: 'ASC',
              groupField: '_authGroup',
              intraGroupOrder: 'alpha',
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
        defaultSortBy="_visGroup"
        defaultGroupsOn={true}
        groups={[
          {
            ...sysGroupBase,
            field: '_recentGroup',
            groupSelectorLabel: 'recently browsed',
            open: AGE_BUCKETS.map((b) => b.key).concat([NEVER_KEY]),
            tooltip: ({ fieldValue }: any) =>
              fieldValue === NEVER_KEY
                ? 'Never opened from this browser. Recency is per-device'
                : recentGroupLabel(fieldValue),
            groupLabel: ({ fieldValue }: any) => recentGroupLabel(fieldValue),
            groupIcon: () => <History sx={{ fontSize: 16 }} />,
            onClickItem: open,
          },
          {
            ...sysGroupBase,
            field: '_typeGroup',
            groupSelectorLabel: 'type',
            open: ['*'],
            tooltip: ({ fieldValue }: any) => `${fieldValue} systems`,
            groupLabel: ({ fieldValue }: any) => fieldValue,
            groupIcon: () => <Category sx={{ fontSize: 16 }} />,
            onClickItem: open,
          },
          {
            ...sysGroupBase,
            field: '_visGroup',
            groupSelectorLabel: 'visibility',
            open: ['mine', 'public'],
            tooltip: ({ fieldValue }: any) =>
              fieldValue === 'public'
                ? 'Shared with the whole tenant'
                : 'Yours, and systems shared directly with you',
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
            ...sysGroupBase,
            field: '_authGroup',
            groupSelectorLabel: 'auth',
            open: ['*'],
            tooltip: ({ fieldValue }: any) =>
              `Systems whose default credential is ${fieldValue}`,
            groupLabel: ({ fieldValue }: any) => fieldValue,
            groupIcon: () => <Key sx={{ fontSize: 16 }} />,
            onClickItem: open,
          },
          {
            ...sysGroupBase,
            field: '_ownerGroup',
            groupSelectorLabel: 'owner',
            open: ['*'],
            tooltip: ({ fieldValue }: any) => `Systems owned by ${fieldValue}`,
            groupLabel: ({ fieldValue }: any) => fieldValue,
            groupIcon: () => <Person sx={{ fontSize: 16 }} />,
            onClickItem: open,
          },
          {
            ...sysGroupBase,
            field: '_enabledGroup',
            groupSelectorLabel: 'enabled',
            open: ['enabled', 'disabled'],
            tooltip: ({ fieldValue }: any) =>
              fieldValue === 'enabled'
                ? 'Browsable now'
                : 'Disabled systems fail every listing',
            groupLabel: ({ fieldValue }: any) => fieldValue,
            groupIcon: ({ fieldValue }: any) =>
              fieldValue === 'enabled' ? (
                <Dns sx={{ fontSize: 16, color: '#2e7d32' }} />
              ) : (
                <Lock sx={{ fontSize: 16, color: '#c62828' }} />
              ),
            onClickItem: open,
          },
          {
            ...sysGroupBase,
            field: '_ageGroupUpdated',
            groupSelectorLabel: 'updated',
            open: AGE_BUCKETS.map((b) => b.key),
            tooltip: ({ fieldValue }: any) => ageBucketLabel(fieldValue),
            groupLabel: ({ fieldValue }: any) => ageBucketLabel(fieldValue),
            groupIcon: () => <History sx={{ fontSize: 16 }} />,
            onClickItem: open,
          },
          {
            ...sysGroupBase,
            field: '_alphaGroup',
            groupSelectorLabel: 'A–Z',
            open: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
              .split('')
              .concat(['_', '?']),
            tooltip: ({ fieldValue }: any) =>
              `Systems starting with "${fieldValue}"`,
            groupLabel: ({ fieldValue }: any) => fieldValue,
            groupIcon: () => <SortByAlpha sx={{ fontSize: 16 }} />,
            onClickItem: open,
          },
        ]}
      />
    </QueryWrapper>
  );
};

export default SystemsNavV2;
