import React, { useSyncExternalStore, useCallback } from 'react';
import { useRouteMatch, useHistory, useParams } from 'react-router-dom';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import { Pods } from '@tapis/tapis-typescript';
import { Navbar, NavItem } from '@tapis/tapisui-common';
import PodsLoadingText from '../PodsLoadingText';
import { getPodsAdminMode, subscribePodsAdminMode } from 'utils/podsAdminMode';
import { useAppSelector, updateState, useAppDispatch } from '@redux';

const NavImages: React.FC = () => {
  const { url } = useRouteMatch();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const params = useParams<{ imageId?: string }>();
  const { imageTab } = useAppSelector((state) => state.pods);
  const podsAdminMode = useSyncExternalStore(
    subscribePodsAdminMode,
    getPodsAdminMode
  );
  // Get a pods listing with default request params
  const { data, isLoading, error } = Hooks.useListImages();
  const definitions: Array<Pods.ImageResponseModel> = data?.result ?? [];
  const loadingText = PodsLoadingText();

  // Extract admin context from metadata when admin mode is active
  const adminContext = (data as any)?.metadata?.admin_context;
  const userAccessibleImages: Set<string> | undefined =
    podsAdminMode && adminContext?.user_accessible_images
      ? new Set<string>(adminContext.user_accessible_images)
      : undefined;

  const handleNavClick = useCallback(
    (e: React.MouseEvent, targetId: string) => {
      if (targetId === params.imageId) return;
      if (imageTab === 'edit' && params.imageId) {
        const confirmed = window.confirm(
          'You have unsaved changes in the editor. Discard and switch images?'
        );
        if (!confirmed) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        dispatch(updateState({ imageTab: 'details' }));
      }
    },
    [imageTab, params.imageId, dispatch]
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
          .sort((a, b) => a.image.localeCompare(b.image)) //sort by `image` property
          .map((image) => (
            <div
              key={image.image}
              onClickCapture={(e) => handleNavClick(e, image.image)}
            >
              <NavItem
                to={`/pods/images/${image.image}`}
                icon="image"
                accentLeft={
                  userAccessibleImages
                    ? !userAccessibleImages.has(image.image)
                    : false
                }
                accentLeftColor="#F69723"
              >
                {`${image.image}`}
              </NavItem>
            </div>
          ))
      ) : (
        <i style={{ padding: '16px' }}>No images found</i>
      )}
    </Navbar>
  );
};

export default NavImages;
