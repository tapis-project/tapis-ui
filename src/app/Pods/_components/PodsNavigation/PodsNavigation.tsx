import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAppSelector, updateState, useAppDispatch, PodsState } from '@redux';
import { Stack, Button } from '@mui/material';

interface PodsNavigationProps {
  from?: 'pods' | 'templates' | 'images' | 'volumes' | 'snapshots';
  id?: string;
  id2?: string;
}

const PodsNavigation: React.FC<PodsNavigationProps> = ({ from, id, id2 }) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const {
    podTab,
    podRootTab,
    activePodId,

    imageTab,
    imageRootTab,
    activeImageId,

    snapshotTab,
    snapshotRootTab,
    activeSnapshotId,

    volumeTab,
    volumeRootTab,
    activeVolumeId,

    activeTemplate,
    activeTemplateTag,

    activePage,
  } = useAppSelector((state) => state.pods);

  useEffect(() => {
    // If history.location = '/pods' change activePage to podspage, for managing pressing on pods tab sidebar
    // More state like this maybe needed for other tabs to auto highlight correct tab
    if (history.location.pathname === '/pods') {
      dispatch(updateState({ activePage: 'podspage' }));
    }
  }, [history.location.pathname, dispatch]);

  const handleMiddleClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    destination: string,
    id?: string
  ) => {
    if (event.button === 1) {
      // Middle click
      event.preventDefault();
      let url = `http://localhost:3000/#/pods/${destination}`;
      if (id) {
        url += `/${id}`;
      }
      window.open(url, '_blank');
    }
  };

  const updateStateAndNavigate = (
    destination: 'pods' | 'templates' | 'images' | 'volumes' | 'snapshots',
    from?: string,
    id?: string
  ) => {
    const stateUpdates: Partial<PodsState> = {};

    console.log(`from: ${from}, id: ${id}, activePage: ${activePage}`);

    // This should ensure objId stays the same for each page. Can be set activePodId or '' for root.
    if (id !== undefined) {
      switch (from) {
        case 'pods':
          stateUpdates.activePodId = id;
          break;
        case 'templates':
          stateUpdates.activeTemplate = id;
          stateUpdates.activeTemplateTag = id2;
          break;
        case 'images':
          stateUpdates.activeImageId = id;
          break;
        case 'volumes':
          stateUpdates.activeVolumeId = id;
          break;
        case 'snapshots':
          stateUpdates.activeSnapshotId = id;
          break;
        default:
          console.warn('Unexpected from:', from);
      }
    }

    // Close edit tabs when navigating to another page as most people won't want that?
    if (volumeTab === 'edit') {
      dispatch(updateState({ volumeTab: 'details' }));
    }

    if (snapshotTab === 'edit') {
      dispatch(updateState({ snapshotTab: 'details' }));
    }

    if (imageTab === 'edit') {
      dispatch(updateState({ imageTab: 'details' }));
    }

    if (podTab === 'secrets' || podTab === 'edit') {
      dispatch(updateState({ podTab: 'details' }));
    }

    switch (destination) {
      case 'pods':
        if (from === 'pods') {
          stateUpdates.activePodId = '';
          stateUpdates.podRootTab = 'dashboard';
          history.push('/pods');
        } else {
          history.push(activePodId ? `/pods/${activePodId}` : '/pods');
        }
        stateUpdates.activePage = 'podspage';
        break;
      case 'templates':
        if (from === 'templates') {
          stateUpdates.activeTemplate = '';
          stateUpdates.activeTemplateTag = '';
          stateUpdates.templateNavSelectedItems = '';
          stateUpdates.templateRootTab = 'dashboard';
          history.push('/pods/templates');
        } else {
          history.push(
            activeTemplate
              ? activeTemplateTag
                ? `/pods/templates/${activeTemplate}/tags/${activeTemplateTag}`
                : `/pods/templates/${activeTemplate}`
              : '/pods/templates'
          );
        }
        stateUpdates.activePage = 'templatespage';
        break;
      case 'images':
        if (from === 'images') {
          stateUpdates.activeImageId = '';
          stateUpdates.imageRootTab = 'dashboard';
          history.push('/pods/images');
        } else {
          history.push(
            activeImageId ? `/pods/images/${activeImageId}` : '/pods/images'
          );
        }
        stateUpdates.activePage = 'imagespage';
        break;
      case 'volumes':
        if (from === 'volumes') {
          stateUpdates.activeVolumeId = '';
          stateUpdates.volumeRootTab = 'dashboard';
          history.push('/pods/volumes');
        } else {
          history.push(
            activeVolumeId ? `/pods/volumes/${activeVolumeId}` : '/pods/volumes'
          );
        }
        stateUpdates.activePage = 'volumespage';
        break;
      case 'snapshots':
        if (from === 'snapshots') {
          stateUpdates.activeSnapshotId = '';
          stateUpdates.snapshotRootTab = 'dashboard';
          history.push('/pods/snapshots');
        } else {
          history.push(
            activeSnapshotId
              ? `/pods/snapshots/${activeSnapshotId}`
              : '/pods/snapshots'
          );
        }
        stateUpdates.activePage = 'snapshotspage';
        break;
      default:
        console.warn('Unexpected destination:', destination);
    }

    dispatch(updateState(stateUpdates));
  };

  return (
    <Stack spacing={2} direction="row">
      <Button
        variant="outlined"
        color={activePage === 'podspage' ? 'secondary' : 'primary'}
        size="small"
        onClick={() => updateStateAndNavigate('pods', from, id)}
        onAuxClick={(event) => handleMiddleClick(event, 'pods', id)}
      >
        Pods
      </Button>
      <Button
        variant="outlined"
        color={activePage === 'templatespage' ? 'secondary' : 'primary'}
        size="small"
        onClick={() => updateStateAndNavigate('templates', from, id)}
        onAuxClick={(event) => handleMiddleClick(event, 'templates', id)}
      >
        Templates
      </Button>
      <Button
        variant="outlined"
        color={activePage === 'imagespage' ? 'secondary' : 'primary'}
        size="small"
        onClick={() => updateStateAndNavigate('images', from, id)}
        onAuxClick={(event) => handleMiddleClick(event, 'images', id)}
      >
        Images
      </Button>
      <Button
        variant="outlined"
        color={activePage === 'volumespage' ? 'secondary' : 'primary'}
        size="small"
        onClick={() => updateStateAndNavigate('volumes', from, id)}
        onAuxClick={(event) => handleMiddleClick(event, 'volumes', id)}
      >
        Volumes
      </Button>
      <Button
        variant="outlined"
        color={activePage === 'snapshotspage' ? 'secondary' : 'primary'}
        size="small"
        onClick={() => updateStateAndNavigate('snapshots', from, id)}
        onAuxClick={(event) => handleMiddleClick(event, 'snapshots', id)}
      >
        Snapshots
      </Button>
    </Stack>
  );
};

export default PodsNavigation;
