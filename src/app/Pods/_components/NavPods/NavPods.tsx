import React, { useState, useEffect } from 'react';
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

const NavPods: React.FC = () => {
  const { url } = useRouteMatch();
  const history = useHistory();

  const params = useParams<{ podId?: string }>();

  const { data, isLoading, error } = Hooks.useListPods();
  const definitions: Array<Pods.PodResponseModel> = data?.result ?? [];
  const loadingText = PodsLoadingText();

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
    return <div>Error: {error.message}</div>;
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
          height: 'calc(100vh - 140px)', // Make the nav take full viewport height
          overflowY: 'auto', // Enable vertical scrolling only for this div
        }}
        //className={styles['scroll-container']}
      >
        <FilterableObjectsList
          objects={systems}
          defaultField={'status'}
          defaultOnClickItem={(system: any) => {
            history.push(`/pods/${system.pod_id!}`);
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
