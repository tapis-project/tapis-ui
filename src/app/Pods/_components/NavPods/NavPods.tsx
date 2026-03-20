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
import { QueryWrapper, FilterableObjectsList } from '@tapis/tapisui-common';
import PodsLoadingText from '../PodsLoadingText';
import {
  Dns,
  Public,
  Person,
  Delete,
  Restore,
  Lock,
  LockOpen,
} from '@mui/icons-material';
import { getPodsAdminMode, subscribePodsAdminMode } from 'utils/podsAdminMode';
import { computeDiff, buildChangeSummary } from '../Wizards/Common/computeDiff';

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

  // return (
  //   <Navbar>
  //     {definitions.length ? (
  //       definitions
  //         .sort((a, b) => a.pod_id.localeCompare(b.pod_id))
  //         .map((pod) => (
  //           <NavItem
  //             to={`/pods/${pod.pod_id}`}
  //             icon="visualization"
  //             key={pod.pod_id}
  //           >
  //             {`${pod.pod_id}`}
  //           </NavItem>
  //         ))
  //     ) : (
  //       <i style={{ padding: '16px' }}>No pods found</i>
  //     )}
  //   </Navbar>
  // );

  const systems: Array<Pods.PodResponseModel> = (data?.result ?? [])
    .slice()
    .sort((a, b) => (a.pod_id ?? '').localeCompare(b.pod_id ?? ''));
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
        <FilterableObjectsList
          objects={systems}
          defaultField={'status'}
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
          orderGroupsBy={'ASC'}
          selectedField={params.podId}
          isSelectedItem={({ object, selectedField }) =>
            object.pod_id === selectedField
          }
          listItemIconStyle={{ minWidth: '42px' }}
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
              field: 'status',
              groupSelectorLabel: 'status',
              primaryItemText: ({ object }: any) => object.pod_id, // TODO FIXME This 'any' makes me sad. Fix
              secondaryItemText: ({ object }: any) =>
                object.image
                  ? object.image
                  : '~' + object.template.split('@')[0],
              open: [
                'AVAILABLE',
                'CREATING',
                'ERROR',
                'COMPLETE',
                'REQUESTED',
                'DELETING',
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
              groupItemIcon: <Dns />,
            },
          ]}
        ></FilterableObjectsList>
      </div>
    </QueryWrapper>
  );
};

export default NavPods;
