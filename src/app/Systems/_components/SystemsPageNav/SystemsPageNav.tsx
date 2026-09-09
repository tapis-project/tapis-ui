/**
 * SystemsPageNav — the /systems sidebar on the FilterableObjectsListV2 kit,
 * riding the same windowed systems source the Files page shares.
 *
 * Everything the old V1 nav could do survives: group by visibility (the old
 * default), host-ish identity on the second line, type, auth method and
 * enabled groupings — and deleted systems ride the same list now, struck
 * through with a trash badge that restores, instead of a separate panel.
 * On top of that it gains what every other rebuilt nav has —
 * search, real sorts, quick filters, the window ledger, skeleton first
 * paint, and a pinned header.
 */
import React, { useState } from 'react';
import { useHistory, useRouteMatch, useLocation } from 'react-router-dom';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import { Systems } from '@tapis/tapis-typescript';
import { NavSearchScope, NavWindowBar } from 'app/_components/NavSpine';
import { FilterableObjectsListV2, QueryWrapper } from '@tapis/tapisui-common';
import type {
  FilterConfig,
  ItemBadge,
  SortOption,
} from '@tapis/tapisui-common';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import {
  Dns,
  Public,
  Person,
  Lock,
  Key,
  SortByAlpha,
  History,
  Storage,
  Category,
  RestoreFromTrash,
  CloseRounded,
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
import { SystemTypeTile } from 'app/_components/NavV2Kit/SystemTypeTile';
import { useSystemsSource } from 'app/Files/_components/systemsSource';
import { setSystemsSearch } from '../systemsSearch';
import {
  deletedSystemsPref,
  useDeletedVisibility,
} from '../deletedSystemsPref';
import DeletedBanner from 'app/_components/PageShell/DeletedBanner';
import UndeleteSystemModal from '../SystemToolbar/UndeleteSystemModal';
import styles from 'app/_components/PageShell/PageShell.module.scss';

const systemsFilterConfig: FilterConfig = {
  filterableFields: [
    {
      field: 'updated',
      label: 'Updated',
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
          id: 'quick-exec',
          label: 'Runs jobs',
          filter: {
            id: 'quick-exec',
            field: '_quick',
            type: 'quick',
            value: 'exec',
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
    { field: 'created', label: 'Created', filterType: 'timeRange' },
  ],
  filterFunctions: {
    updated: timeRangeFilter((o) => o.updated),
    created: timeRangeFilter((o) => o.created),
    _quick: predicateFilter({
      mine: (o) => !o.isPublic,
      public: (o) => !!o.isPublic,
      exec: (o) => !!o.canExec,
      disabled: (o) => o.enabled === false,
    }),
  },
};

/** deleted rows keep their place in every sort and group — struck through
 *  and dimmed, wearing the trash badge — instead of living in a side panel */
const struck = (text: React.ReactNode) => (
  <span style={{ textDecoration: 'line-through', opacity: 0.55 }}>{text}</span>
);

const sysGroupBase = {
  primaryItemText: ({ object }: any) =>
    object._deleted
      ? struck(midEllipsis(object.id ?? '?'))
      : midEllipsis(object.id ?? '?'),
  secondaryItemText: ({ object }: any) => {
    const second = object.host
      ? midEllipsis(object.host, 30)
      : object.systemType ?? '';
    return object._deleted ? struck(second) : second;
  },
  groupItemIcon: ({ object }: any) =>
    object._deleted ? (
      <span style={{ opacity: 0.45 }}>
        <SystemTypeTile type={object.systemType} />
      </span>
    ) : (
      <SystemTypeTile type={object.systemType} />
    ),
};

const SystemsPageNav: React.FC = () => {
  const {
    systems: sourceSystems,
    isLoading,
    error,
    spine,
  } = useSystemsSource();
  // Deleted systems ride the same list. allAttributes, because this list
  // is the ONLY read that can see them whole (the single-system GET has no
  // showDeleted) — host, type, auth and dates all come from here, so the
  // rows group, sort and search exactly like the living.
  const { data: deletedData } = Hooks.useDeletedList({
    search: 'deleted.eq.true',
    showDeleted: true,
    select: 'allAttributes',
  });
  const [restoring, setRestoring] = useState<string | undefined>(undefined);
  // the per-device choice: hidden means the rows stay out of the list
  // entirely — the banner (and Settings) is how they come back
  const deletedVisibility = useDeletedVisibility();
  const deletedCount = (deletedData?.result ?? []).length;

  const { url } = useRouteMatch();
  const history = useHistory();
  // The nav mounts beside the routes, not inside them, so useParams is empty
  // here — the selected id comes from the pathname.
  const { pathname } = useLocation();
  const selectedSystemId = decodeURIComponent(pathname.split('/')[2] ?? '');

  // the deleted listing outvotes the window: right after a delete the
  // window can still hold the row alive (its refetch is in flight), and
  // for that beat the list showed the system twice — once living, once
  // struck. The live copy yields whenever the deleted list has the id.
  const deletedIds = new Set(
    ((deletedData?.result ?? []) as any[]).map((s) => s.id)
  );
  const systems = [
    ...sourceSystems.filter((s: any) => !deletedIds.has(s.id)),
    ...(deletedVisibility === 'show'
      ? ((deletedData?.result ?? []) as any[]).map((s) => ({
          ...s,
          _deleted: true,
        }))
      : []),
  ].map((s: any) => ({
    ...s,
    _typeGroup: s.systemType ?? '(unknown)',
    _visGroup: s.isPublic ? 'public' : 'mine',
    _ownerGroup: s.owner ?? '(unknown)',
    _authGroup: s.defaultAuthnMethod ?? '(unknown)',
    _enabledGroup: s.enabled ? 'enabled' : 'disabled',
    _ageGroupUpdated: getAgeBucket(s.updated),
    _alphaGroup: (s.id ?? '?')[0].toUpperCase(),
  }));

  // deleted rows open their page too — the detail layout renders them
  // read-only from the deleted listing, with Restore on the card
  const open = (object: any) => history.push(`${url}/${object.id}`);

  return (
    // nav-fill hands the list a definite height, so its header (search +
    // ledger) pins and only the rows scroll; first paint is skeleton rows
    <QueryWrapper
      isLoading={false}
      error={(error as Error) ?? null}
      className={styles['nav-fill']}
    >
      <FilterableObjectsListV2
        objects={systems}
        loading={isLoading}
        belowToolbar={
          <>
            {spine && <NavWindowBar noun="systems" spine={spine} />}
            {/* right under the ledger: the deleted count and its flip */}
            <DeletedBanner
              count={deletedCount}
              noun="system"
              pref={deletedSystemsPref}
            />
          </>
        }
        // deleted systems ride this same list, so the search finds them
        // whenever the preference has them showing, and cannot when it
        // does not. Both are worth saying while a query is in the box.
        searchScope={() => (
          <NavSearchScope
            noun="systems"
            spine={spine}
            byPreference={
              deletedCount > 0 &&
              (deletedVisibility === 'show'
                ? `Includes the ${deletedCount} deleted.`
                : `Not the ${deletedCount} deleted, while they are hidden.`)
            }
          />
        )}
        emptyMessage="No systems visible. Create one, or ask for a share."
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
        // one search for the page: this also filters the landing table
        onSearchChange={setSystemsSearch}
        searchFields={(o: any) =>
          [
            o.id,
            o.host,
            o.description,
            o.owner,
            o.systemType,
            o.defaultAuthnMethod,
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
        middleClickLink={(o: any) => (o.id ? `/#/systems/${o.id}` : undefined)}
        itemBadges={(o: any) => {
          const badges: ItemBadge[] = [];
          // ONE bottom slot. A deleted row's badge IS its restore door:
          // gray trash at rest, never green, press to bring it back.
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
          // priority: disabled beats the public globe
          if (o.enabled === false) {
            badges.push({
              position: 'bottom-right',
              content: <Lock sx={{ fontSize: 11, color: '#c62828' }} />,
              tooltip: 'Disabled: jobs and listings fail until re-enabled',
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
                ? 'Usable now'
                : 'Disabled systems refuse jobs and listings',
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
      {restoring && (
        <UndeleteSystemModal
          systemId={restoring}
          toggle={() => setRestoring(undefined)}
        />
      )}
    </QueryWrapper>
  );
};

export default SystemsPageNav;
