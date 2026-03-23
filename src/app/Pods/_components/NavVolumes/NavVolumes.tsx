import React, { useSyncExternalStore, useCallback } from 'react';
import { useRouteMatch, useHistory, useParams } from 'react-router-dom';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import { Pods } from '@tapis/tapis-typescript';
import { Navbar, NavItem } from '@tapis/tapisui-common';
import PodsLoadingText from '../PodsLoadingText';
import { getPodsAdminMode, subscribePodsAdminMode } from 'utils/podsAdminMode';
import { useAppSelector, updateState, useAppDispatch } from '@redux';

const NavVolumes: React.FC = () => {
  const { url } = useRouteMatch();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const params = useParams<{ volumeId?: string }>();
  const { volumeTab } = useAppSelector((state) => state.pods);
  const podsAdminMode = useSyncExternalStore(
    subscribePodsAdminMode,
    getPodsAdminMode
  );
  const { data, isLoading, error } = Hooks.useListVolumes();
  const definitions: Array<Pods.VolumeResponseModel> = data?.result ?? [];
  const loadingText = PodsLoadingText();

  // Extract admin context from metadata when admin mode is active
  const adminContext = (data as any)?.metadata?.admin_context;
  const userAccessibleIds: Set<string> | undefined =
    podsAdminMode && adminContext?.user_accessible_ids
      ? new Set<string>(adminContext.user_accessible_ids)
      : undefined;

  const handleNavClick = useCallback(
    (e: React.MouseEvent, targetId: string) => {
      if (targetId === params.volumeId) return;
      if (volumeTab === 'edit' && params.volumeId) {
        const confirmed = window.confirm(
          'You have unsaved changes in the editor. Discard and switch volumes?'
        );
        if (!confirmed) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        dispatch(updateState({ volumeTab: 'details' }));
      }
    },
    [volumeTab, params.volumeId, dispatch]
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

  // Display returns upper case first letter, lower case rest for the pod.status
  return (
    <Navbar>
      {definitions.length ? (
        definitions
          .sort((a, b) => a.volume_id.localeCompare(b.volume_id)) //sort by `volume_id` property
          .map((volume) => (
            <div
              key={volume.volume_id}
              onClickCapture={(e) => handleNavClick(e, volume.volume_id)}
            >
              <NavItem
                to={`/pods/volumes/${volume.volume_id}`}
                icon="folder"
                accentLeft={
                  userAccessibleIds
                    ? !userAccessibleIds.has(volume.volume_id)
                    : false
                }
                accentLeftColor="#F69723"
              >
                {`${volume.volume_id}`}
              </NavItem>
            </div>
          ))
      ) : (
        <i style={{ padding: '16px' }}>No volumes found</i>
      )}
    </Navbar>
  );
};

export default NavVolumes;
