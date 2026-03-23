import React, { useSyncExternalStore, useCallback } from 'react';
import { useRouteMatch, useHistory, useParams } from 'react-router-dom';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import { Pods } from '@tapis/tapis-typescript';
import { Navbar, NavItem } from '@tapis/tapisui-common';
import PodsLoadingText from '../PodsLoadingText';
import { getPodsAdminMode, subscribePodsAdminMode } from 'utils/podsAdminMode';
import { useAppSelector, updateState, useAppDispatch } from '@redux';

const NavSnapshots: React.FC = () => {
  const { url } = useRouteMatch();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const params = useParams<{ snapshotId?: string }>();
  const { snapshotTab } = useAppSelector((state) => state.pods);
  const podsAdminMode = useSyncExternalStore(
    subscribePodsAdminMode,
    getPodsAdminMode
  );
  const { data, isLoading, error } = Hooks.useListSnapshots();
  const definitions: Array<Pods.SnapshotResponseModel> = data?.result ?? [];
  const loadingText = PodsLoadingText();

  // Extract admin context from metadata when admin mode is active
  const adminContext = (data as any)?.metadata?.admin_context;
  const userAccessibleIds: Set<string> | undefined =
    podsAdminMode && adminContext?.user_accessible_ids
      ? new Set<string>(adminContext.user_accessible_ids)
      : undefined;

  const handleNavClick = useCallback(
    (e: React.MouseEvent, targetId: string) => {
      if (targetId === params.snapshotId) return;
      if (snapshotTab === 'edit' && params.snapshotId) {
        const confirmed = window.confirm(
          'You have unsaved changes in the editor. Discard and switch snapshots?'
        );
        if (!confirmed) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        dispatch(updateState({ snapshotTab: 'details' }));
      }
    },
    [snapshotTab, params.snapshotId, dispatch]
  );

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

  return (
    <Navbar>
      {definitions.length ? (
        definitions
          .sort((a, b) => a.snapshot_id.localeCompare(b.snapshot_id)) //sort by `snapshot_id` property
          .map((snapshot) => (
            <div
              key={snapshot.snapshot_id}
              onClickCapture={(e) => handleNavClick(e, snapshot.snapshot_id)}
            >
              <NavItem
                to={`/pods/snapshots/${snapshot.snapshot_id}`}
                icon="folder"
                accentLeft={
                  userAccessibleIds
                    ? !userAccessibleIds.has(snapshot.snapshot_id)
                    : false
                }
                accentLeftColor="#F69723"
              >
                {`${snapshot.snapshot_id}`}
              </NavItem>
            </div>
          ))
      ) : (
        <i style={{ padding: '16px' }}>No snapshots found</i>
      )}
    </Navbar>
  );
};

export default NavSnapshots;
