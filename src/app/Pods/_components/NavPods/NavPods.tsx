import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { useAppSelector, updateState, useAppDispatch } from '@redux';
import {
  useHistory,
  useRouteMatch,
  useLocation,
  useParams,
} from 'react-router-dom';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import { Pods } from '@tapis/tapis-typescript';
import { Navbar, NavItem } from '@tapis/tapisui-common';
import {
  QueryWrapper,
  FilterableObjectsListV2,
  getStatusColor,
} from '@tapis/tapisui-common';
import type { ItemBadge, SortOption } from '@tapis/tapisui-common';
import PodsLoadingText from '../PodsLoadingText';
import {
  Dns,
  Public,
  Person,
  Delete,
  Restore,
  Lock,
  LockOpen,
  AccessAlarm,
  FiberManualRecord,
  SortByAlpha,
  Storage,
  Memory,
  Queue,
  Shield,
  Lan,
} from '@mui/icons-material';
import { Tooltip, Chip } from '@mui/material';
import { getPodsAdminMode, subscribePodsAdminMode } from 'utils/podsAdminMode';
import { computeDiff, buildChangeSummary } from '../Wizards/Common/computeDiff';

// ── Age bucket helpers ──────────────────────────────────────────

const AGE_BUCKETS = [
  { key: '00', label: '< 30 min', maxMs: 30 * 60_000 },
  { key: '01', label: '< 1 hour', maxMs: 60 * 60_000 },
  { key: '02', label: '< 2 hours', maxMs: 2 * 60 * 60_000 },
  { key: '03', label: '< 4 hours', maxMs: 4 * 60 * 60_000 },
  { key: '04', label: '< 8 hours', maxMs: 8 * 60 * 60_000 },
  { key: '05', label: '< 1 day', maxMs: 24 * 60 * 60_000 },
  { key: '06', label: '< 1 week', maxMs: 7 * 24 * 60 * 60_000 },
  { key: '07', label: '< 2 weeks', maxMs: 14 * 24 * 60 * 60_000 },
  { key: '08', label: '< 1 month', maxMs: 30 * 24 * 60 * 60_000 },
  { key: '09', label: '< 6 months', maxMs: 182 * 24 * 60 * 60_000 },
  { key: '10', label: '< 1 year', maxMs: 365 * 24 * 60 * 60_000 },
  { key: '11', label: '> 1 year', maxMs: Infinity },
];

const getAgeBucket = (ts: string | undefined): string => {
  if (!ts) return '11';
  const age = Date.now() - new Date(ts).getTime();
  for (const b of AGE_BUCKETS) {
    if (age < b.maxMs) return b.key;
  }
  return '11';
};

const ageBucketLabel = (key: string): string =>
  AGE_BUCKETS.find((b) => b.key === key)?.label ?? 'Unknown';

const timeAgo = (ts: string | undefined): string => {
  if (!ts) return '';
  const secs = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (secs < 0) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
};

// ── Volume & resource helpers ───────────────────────────────────

/** Count volume_mounts entries matching a given type */
const countVolsByType = (pod: any, volType: string): number =>
  Object.values(pod.volume_mounts ?? {}).filter((v: any) => v.type === volType)
    .length;

/** Reusable base props shared by every pod group definition */
const podGroupBase = {
  primaryItemText: ({ object }: any) => object.pod_id,
  secondaryItemText: ({ object }: any) =>
    object.image ? object.image : '~' + object.template.split('@')[0],
  groupItemIcon: <Dns />,
};

/** Volume-type sort+group definition pair */
type VolDef = { volType: string; label: string; unit: [string, string] };

const VOL_DEFS: VolDef[] = [
  {
    volType: 'tapisvolume',
    label: 'Volumes',
    unit: ['volume', 'volumes'],
  },
  { volType: 'pvc', label: 'PVCs', unit: ['pvc', 'pvcs'] },
  {
    volType: 'tapissnapshot',
    label: 'Snapshots',
    unit: ['snapshot', 'snapshots'],
  },
];

/** A-Z by pod_id — used for categorical/count sorts where intra-group order is arbitrary */
const alphaComparator = (a: any, b: any) =>
  (a.pod_id ?? '').localeCompare(b.pod_id ?? '');

const volSortOption = (d: VolDef): SortOption => ({
  id: `_n_${d.volType}`,
  label: `# ${d.label}`,
  comparator: alphaComparator,
  itemLabel: (o: any) => {
    const n = countVolsByType(o, d.volType);
    return `${n} ${n === 1 ? d.unit[0] : d.unit[1]}`;
  },
  defaultOrder: 'DESC' as const,
  groupField: `_n_${d.volType}`,
  intraGroupOrder: 'alpha' as const,
});

const COUNT_OPEN = Array.from({ length: 11 }, (_, i) => String(i));

const volGroupDef = (d: VolDef) => ({
  ...podGroupBase,
  field: `_n_${d.volType}`,
  groupSelectorLabel: `# ${d.label.toLowerCase()}`,
  open: COUNT_OPEN,
  tooltip: ({ fieldValue }: any) =>
    `Pods with ${fieldValue} ${
      parseInt(fieldValue) === 1 ? d.unit[0] : d.unit[1]
    }`,
  groupLabel: ({ fieldValue }: any) =>
    `${fieldValue} ${parseInt(fieldValue) === 1 ? d.unit[0] : d.unit[1]}`,
  groupIcon: () => <Storage sx={{ fontSize: 16 }} />,
});

/** Categorise tapis_auth: only applies to http networking entries */
const getTapisAuthCategory = (pod: any): 'on' | 'off' | 'non-http' => {
  const nets = Object.values(pod.networking ?? {}) as any[];
  const httpNets = nets.filter((n) => n.protocol === 'http');
  if (httpNets.length === 0) return 'non-http';
  return httpNets.some((n) => n.tapis_auth === true) ? 'on' : 'off';
};

const NavPods: React.FC = () => {
  const { url } = useRouteMatch();
  const history = useHistory();
  const dispatch = useAppDispatch();

  const params = useParams<{ podId?: string }>();
  const { podTab, updatePodData } = useAppSelector((state) => state.pods);
  const podsAdminMode = useSyncExternalStore(
    subscribePodsAdminMode,
    getPodsAdminMode
  );

  const { data, isLoading, error } = Hooks.useListPods();
  const definitions: Array<Pods.PodResponseModel> = data?.result ?? [];
  const loadingText = PodsLoadingText();

  // Extract admin context from metadata when admin mode is active
  const adminContext = (data as any)?.metadata?.admin_context;
  const userAccessibleIds: Set<string> | undefined =
    podsAdminMode && adminContext?.user_accessible_ids
      ? new Set<string>(adminContext.user_accessible_ids)
      : undefined;

  if (isLoading) {
    return (
      <Navbar>
        <div style={{ paddingLeft: '16px' }}>
          <NavItem icon="visualization">{loadingText}</NavItem>
        </div>
      </Navbar>
    );
  }
  if (error) {
    return (
      <div style={{ paddingLeft: '16px', paddingTop: '16px' }}>
        Error: {error.message}
      </div>
    );
  }

  const systems: Array<
    Pods.PodResponseModel & {
      _alphaGroup: string;
      _ageGroup: string;
      _ageGroupModified: string;
      _ageGroupRunning: string;
      _n_tapisvolume: string;
      _n_pvc: string;
      _n_tapissnapshot: string;
      _gpus: string;
      _computeQueue: string;
      _tapisAuth: string;
      _nNetworks: string;
    }
  > = (data?.result ?? []).slice().map((pod) => ({
    ...pod,
    _alphaGroup: (pod.pod_id ?? '?')[0].toUpperCase(),
    _ageGroup: getAgeBucket(
      pod.creation_ts ? String(pod.creation_ts) : undefined
    ),
    _ageGroupModified: getAgeBucket(
      pod.update_ts ? String(pod.update_ts) : undefined
    ),
    _ageGroupRunning: getAgeBucket(
      (pod as any).start_instance_ts
        ? String((pod as any).start_instance_ts)
        : undefined
    ),
    // Volume counts (string for grouping)
    _n_tapisvolume: String(countVolsByType(pod, 'tapisvolume')),
    _n_pvc: String(countVolsByType(pod, 'pvc')),
    _n_tapissnapshot: String(countVolsByType(pod, 'tapissnapshot')),
    // Resource fields
    _gpus: String((pod as any).resources?.gpus ?? 0),
    _computeQueue: (pod as any).compute_queue ?? 'none',
    _tapisAuth: getTapisAuthCategory(pod),
    _nNetworks: String(Object.keys(pod.networking ?? {}).length),
  }));
  //console.log('activePodId', activePodId);
  return (
    <QueryWrapper isLoading={isLoading} error={[error]}>
      <div
        style={{
          //borderBottom: '1px solid #CCCCCC',
          borderRight: '1px solid #CCCCCC',
        }}
        //className={styles['scroll-container']}
      >
        <FilterableObjectsListV2
          objects={systems}
          sortOptions={
            [
              {
                id: 'pod_id',
                label: 'Name (A–Z)',
                comparator: (a: any, b: any) =>
                  (a.pod_id ?? '').localeCompare(b.pod_id ?? ''),
                defaultOrder: 'ASC',
                groupField: '_alphaGroup',
                intraGroupOrder: 'alpha',
              },
              {
                id: 'status',
                label: 'Status',
                comparator: alphaComparator,
                defaultOrder: 'ASC',
                groupField: 'status',
                intraGroupOrder: 'alpha',
              },
              {
                id: 'creation_ts',
                label: 'Created',
                comparator: (a: any, b: any) =>
                  new Date(a.creation_ts ?? 0).getTime() -
                  new Date(b.creation_ts ?? 0).getTime(),
                itemLabel: (a: any) => timeAgo(a.creation_ts),
                defaultOrder: 'ASC',
                groupField: '_ageGroup',
              },
              {
                id: 'update_ts',
                label: 'Last Modified',
                comparator: (a: any, b: any) =>
                  new Date(a.update_ts ?? 0).getTime() -
                  new Date(b.update_ts ?? 0).getTime(),
                itemLabel: (a: any) => timeAgo(a.update_ts),
                defaultOrder: 'ASC',
                groupField: '_ageGroupModified',
              },
              {
                id: 'start_instance_ts',
                label: 'Time Running',
                comparator: (a: any, b: any) =>
                  new Date(a.start_instance_ts ?? 0).getTime() -
                  new Date(b.start_instance_ts ?? 0).getTime(),
                itemLabel: (a: any) => timeAgo(a.start_instance_ts),
                defaultOrder: 'ASC',
                groupField: '_ageGroupRunning',
              },
              // Volume count sorts (generated)
              ...VOL_DEFS.map(volSortOption),
              // Networking sort
              {
                id: '_nNetworks',
                label: '# Networks',
                comparator: alphaComparator,
                itemLabel: (o: any) => {
                  const n = Object.keys(o.networking ?? {}).length;
                  return `${n} network${n !== 1 ? 's' : ''}`;
                },
                defaultOrder: 'ASC',
                groupField: '_nNetworks',
                intraGroupOrder: 'alpha',
              },
              // Resource sorts
              {
                id: '_gpus',
                label: 'GPUs',
                comparator: alphaComparator,
                itemLabel: (o: any) => {
                  const n = Number(o.resources?.gpus ?? 0);
                  return `${n} GPU${n !== 1 ? 's' : ''}`;
                },
                defaultOrder: 'ASC',
                groupField: '_gpus',
                intraGroupOrder: 'alpha',
              },
              {
                id: '_computeQueue',
                label: 'Compute Queue',
                comparator: alphaComparator,
                itemLabel: (o: any) => (o as any).compute_queue || 'none',
                defaultOrder: 'ASC',
                groupField: '_computeQueue',
                intraGroupOrder: 'alpha',
              },
              {
                id: '_tapisAuth',
                label: 'Tapis Auth',
                comparator: alphaComparator,
                itemLabel: (o: any) => {
                  const cat = getTapisAuthCategory(o);
                  return cat === 'on'
                    ? 'auth on'
                    : cat === 'off'
                    ? 'auth off'
                    : 'non-http';
                },
                defaultOrder: 'ASC',
                groupField: '_tapisAuth',
                intraGroupOrder: 'alpha',
              },
            ] as SortOption[]
          }
          defaultSortBy="update_ts"
          defaultGroupsOn={true}
          searchable={true}
          searchFields={(obj: any) =>
            [obj.pod_id, obj.image, obj.template, obj.description]
              .filter(Boolean)
              .join(' ')
          }
          itemBadges={(object: any) => {
            const badges: ItemBadge[] = [];

            // Status dot badge (top-right) with nice colors
            const sc = getStatusColor(object.status);
            badges.push({
              position: 'top-right',
              content: (
                <Chip
                  label={object.status}
                  size="small"
                  sx={{
                    height: 16,
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    backgroundColor: sc.bg,
                    color: sc.fg,
                    borderRadius: '4px',
                    '& .MuiChip-label': { px: 0.5 },
                  }}
                />
              ),
              tooltip: `Status: ${object.status}${
                object.status_requested
                  ? ` (requested: ${object.status_requested})`
                  : ''
              }`,
            });

            // TTL clock badge (bottom-right) if time_to_live is not -1
            const ttl = object.time_to_live;
            if (ttl !== undefined && ttl !== null && ttl !== -1) {
              const hours = Math.round(ttl / 3600);
              const label =
                ttl < 3600
                  ? `${Math.round(ttl / 60)}m`
                  : hours < 24
                  ? `${hours}h`
                  : `${Math.round(hours / 24)}d`;
              badges.push({
                position: 'bottom-right',
                content: (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 2,
                      fontSize: '0.6rem',
                      color: '#8d6e63',
                      fontWeight: 500,
                    }}
                  >
                    <AccessAlarm sx={{ fontSize: 12 }} />
                    {label}
                  </span>
                ),
                tooltip: `Time-to-live: ${
                  ttl < 3600
                    ? `${Math.round(ttl / 60)} minutes`
                    : `${hours} hours`
                }`,
              });
            }

            return badges;
          }}
          defaultOnClickItem={(system: any) => {
            const targetId = system.pod_id!;
            // If already viewing this pod, no-op
            if (targetId === params.podId) return;

            // If in edit mode, guard navigation
            if (podTab === 'edit' && params.podId) {
              // Compute actual diff to determine if there are real changes
              const currentPod = definitions.find(
                (p) => p.pod_id === params.podId
              );
              const hasDraft =
                updatePodData &&
                typeof updatePodData === 'object' &&
                Object.keys(updatePodData).length > 0;
              const changes =
                hasDraft && currentPod
                  ? computeDiff(currentPod, updatePodData)
                  : null;
              const hasRealChanges = changes?.hasChanges === true;

              if (hasRealChanges) {
                const summary = buildChangeSummary(changes);
                let changeList = '';
                if (summary.length > 0) {
                  changeList =
                    '\n\nUnsaved changes:\n' +
                    summary
                      .map((s) => `  • ${s.field} (${s.type}): ${s.detail}`)
                      .join('\n');
                }

                const confirmed = window.confirm(
                  `You have unsaved changes. Discard and switch pods?${changeList}`
                );
                if (!confirmed) return;
              }
              // Exit edit mode and clear draft before navigating
              dispatch(
                updateState({
                  podTab: 'details',
                  updatePodData: undefined,
                })
              );
            }

            history.push(`/pods/${targetId}`);
          }}
          includeAll={true}
          includeAllGroupLabel="All Pods"
          includeAllSelectorLabel="all pods"
          includeAllPrimaryItemText={({ object }: any) => object.pod_id}
          defaultGroupIcon={<Dns />}
          filterable={false}
          groupable={true}
          orderable={true}
          compact={true}
          selectedField={params.podId}
          isSelectedItem={({ object, selectedField }) =>
            object.pod_id === selectedField
          }
          listItemIconStyle={{ minWidth: '36px' }}
          middleClickLink={(object: any) =>
            object.pod_id ? `/#/pods/${object.pod_id}` : undefined
          }
          itemStyle={
            userAccessibleIds
              ? (object: any) =>
                  !userAccessibleIds.has(object.pod_id)
                    ? { boxShadow: 'inset 0.2rem 0 0 0 #F69723' }
                    : undefined
              : undefined
          }
          groups={[
            {
              ...podGroupBase,
              field: '_alphaGroup',
              groupSelectorLabel: 'A–Z',
              open: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
                .split('')
                .concat(['_', '?']),
              tooltip: ({ fieldValue }: any) =>
                `Pods starting with "${fieldValue}"`,
              groupLabel: ({ fieldValue }: any) => fieldValue,
              groupIcon: () => <SortByAlpha sx={{ fontSize: 16 }} />,
            },
            {
              ...podGroupBase,
              field: 'status',
              groupSelectorLabel: 'status',
              open: [
                'AVAILABLE',
                'CREATING',
                'ERROR',
                'COMPLETE',
                'REQUESTED',
                'DELETING',
                'STOPPED',
              ],
              tooltip: ({ fieldValue }: any) => {
                switch (fieldValue) {
                  case 'AVAILABLE':
                    return 'Pods in available status';
                  case 'ERROR':
                    return 'Pods in error status';
                  case 'CREATING':
                    return 'Pods that are being created';
                  case 'STOPPED':
                    return 'Pods that are stopped';
                  case 'COMPLETE':
                    return 'Pods that have completed their tasks - no longer running';
                  case 'REQUESTED':
                    return 'Pods that have been requested but not yet started';
                  case 'DELETING':
                    return 'Pods that are being deleted';
                  default:
                    return 'Pods in unknown status';
                }
              },
              groupLabel: ({ fieldValue }: any) => fieldValue,
              groupIcon: ({ fieldValue }: any) => {
                switch (fieldValue) {
                  case 'AVAILABLE':
                    return <Public />;
                  case 'CREATING':
                    return <Restore />;
                  case 'ERROR':
                    return <LockOpen />;
                  case 'STOPPED':
                    return <Lock />;
                  default:
                    return <Person />;
                }
              },
            },
            {
              ...podGroupBase,
              field: '_ageGroup',
              groupSelectorLabel: 'age (created)',
              open: AGE_BUCKETS.map((b) => b.key),
              tooltip: ({ fieldValue }: any) => ageBucketLabel(fieldValue),
              groupLabel: ({ fieldValue }: any) => ageBucketLabel(fieldValue),
              groupIcon: () => <AccessAlarm sx={{ fontSize: 16 }} />,
            },
            {
              ...podGroupBase,
              field: '_ageGroupModified',
              groupSelectorLabel: 'age (modified)',
              open: AGE_BUCKETS.map((b) => b.key),
              tooltip: ({ fieldValue }: any) => ageBucketLabel(fieldValue),
              groupLabel: ({ fieldValue }: any) => ageBucketLabel(fieldValue),
              groupIcon: () => <AccessAlarm sx={{ fontSize: 16 }} />,
            },
            {
              ...podGroupBase,
              field: '_ageGroupRunning',
              groupSelectorLabel: 'age (running)',
              open: AGE_BUCKETS.map((b) => b.key),
              tooltip: ({ fieldValue }: any) => ageBucketLabel(fieldValue),
              groupLabel: ({ fieldValue }: any) => ageBucketLabel(fieldValue),
              groupIcon: () => <AccessAlarm sx={{ fontSize: 16 }} />,
            },
            // Volume count groups (generated)
            ...VOL_DEFS.map(volGroupDef),
            // Networking group
            {
              ...podGroupBase,
              field: '_nNetworks',
              groupSelectorLabel: '# networks',
              open: COUNT_OPEN,
              tooltip: ({ fieldValue }: any) =>
                `Pods with ${fieldValue} network${
                  parseInt(fieldValue) !== 1 ? 's' : ''
                }`,
              groupLabel: ({ fieldValue }: any) =>
                `${fieldValue} network${parseInt(fieldValue) !== 1 ? 's' : ''}`,
              groupIcon: () => <Lan sx={{ fontSize: 16 }} />,
            },
            // Resource groups
            {
              ...podGroupBase,
              field: '_gpus',
              groupSelectorLabel: '# GPUs',
              open: COUNT_OPEN,
              tooltip: ({ fieldValue }: any) =>
                `Pods with ${fieldValue} GPU${
                  parseInt(fieldValue) !== 1 ? 's' : ''
                }`,
              groupLabel: ({ fieldValue }: any) =>
                `${fieldValue} GPU${parseInt(fieldValue) !== 1 ? 's' : ''}`,
              groupIcon: () => <Memory sx={{ fontSize: 16 }} />,
            },
            {
              ...podGroupBase,
              field: '_computeQueue',
              groupSelectorLabel: 'compute queue',
              open: ['default', 'gpu', 'normal', 'none'],
              tooltip: ({ fieldValue }: any) => `Pods on queue "${fieldValue}"`,
              groupLabel: ({ fieldValue }: any) => fieldValue,
              groupIcon: () => <Queue sx={{ fontSize: 16 }} />,
            },
            {
              ...podGroupBase,
              field: '_tapisAuth',
              groupSelectorLabel: 'tapis auth',
              open: ['on', 'off', 'non-http'],
              tooltip: ({ fieldValue }: any) =>
                fieldValue === 'on'
                  ? 'Pods with Tapis auth enabled (HTTP)'
                  : fieldValue === 'off'
                  ? 'Pods with HTTP networking but auth disabled'
                  : 'Pods with non-HTTP or no networking',
              groupLabel: ({ fieldValue }: any) =>
                fieldValue === 'on'
                  ? 'Auth On'
                  : fieldValue === 'off'
                  ? 'Auth Off'
                  : 'Auth Not‑Applicable',
              groupIcon: () => <Shield sx={{ fontSize: 16 }} />,
            },
          ]}
        ></FilterableObjectsListV2>
      </div>
    </QueryWrapper>
  );
};

export default NavPods;
