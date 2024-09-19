// src/app/Pods/_components/PodsNavigation/PodsNavigation.tsx
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateState } from '../../redux/podsSlice';
import { RootState } from '../../redux/store';
import { Stack, Button } from '@mui/material';

interface PodsNavigationProps {
  from?: 'pods' | 'templates' | 'images' | 'volumes' | 'snapshots';
  id?: string;
  id2?: string;
}

const PodsNavigation: React.FC<PodsNavigationProps> = ({ from, id, id2 }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const {
    podTab,
    volumeTab,
    volumeRootTab,

    activeTemplate,
    activeTemplateTag,

    lastPodId,
    lastVolumeId,
    lastSnapshotId,
    lastImageId,
    currentPage,
  } = useSelector((state: RootState) => state.pods);

  useEffect(() => {
    // If history.location = '/pods' change currentPage to podspage
    if (history.location.pathname === '/pods') {
      console.log('testing: ', history.location.pathname);
      dispatch(updateState({ currentPage: 'podspage' }));
    }
  }, [history.location.pathname, dispatch]);

  const updateStateAndNavigate = (
    destination: 'pods' | 'templates' | 'images' | 'volumes' | 'snapshots',
    from?: string,
    id?: string
  ) => {
    const stateUpdates: Partial<RootState['pods']> = {};

    console.log(`from: ${from}, id: ${id}, currentPage: ${currentPage}`);

    // This should ensure objId stays the same for each page. Can be set last podId or '' for root.
    if (id !== undefined) {
      switch (from) {
        case 'pods':
          stateUpdates.lastPodId = id;
          break;
        case 'templates':
          stateUpdates.activeTemplate = id;
          stateUpdates.activeTemplateTag = id2;
          break;
        case 'images':
          stateUpdates.lastImageId = id;
          break;
        case 'volumes':
          stateUpdates.lastVolumeId = id;
          break;
        default:
          console.warn('Unexpected from:', from);
      }
    }

    if (volumeTab === 'edit') {
      dispatch(updateState({ volumeTab: 'details' }));
    }

    if (podTab === 'secrets' || podTab === 'edit') {
      dispatch(updateState({ podTab: 'details' }));
    }

    switch (destination) {
      case 'pods':
        history.push(lastPodId ? `/pods/${lastPodId}` : '/pods');
        stateUpdates.currentPage = 'podspage';
        break;
      case 'templates':
        if (from === 'templates') {
          stateUpdates.activeTemplate = '';
          stateUpdates.activeTemplateTag = '';
          stateUpdates.templateNavSelectedItems = '';
          history.push('/pods/templates');
        } else {
          stateUpdates.activeTemplate = id;
          stateUpdates.activeTemplateTag = id2;
          history.push(
            activeTemplate
              ? activeTemplateTag
                ? `/pods/templates/${activeTemplate}/tags/${activeTemplateTag}`
                : `/pods/templates/${activeTemplate}`
              : '/pods/templates'
          );
        }
        stateUpdates.currentPage = 'templatespage';
        break;
      case 'images':
        history.push(
          lastImageId ? `/pods/images/${lastImageId}` : '/pods/images'
        );
        stateUpdates.currentPage = 'imagespage';
        break;
      case 'volumes':
        if (from === 'volumes') {
          stateUpdates.lastVolumeId = '';
          stateUpdates.volumeRootTab = 'dashboard';
          history.push('/pods/volumes');
        } else {
          stateUpdates.lastVolumeId = id;
          history.push(
            lastVolumeId ? `/pods/volumes/${lastVolumeId}` : '/pods/volumes'
          );
        }
        stateUpdates.currentPage = 'volumespage';
        break;
      case 'snapshots':
        history.push(
          lastSnapshotId
            ? `/pods/snapshots/${lastSnapshotId}`
            : '/pods/snapshots'
        );
        stateUpdates.currentPage = 'snapshotspage';
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
        color={currentPage === 'podspage' ? 'secondary' : 'primary'}
        size="small"
        onClick={() => updateStateAndNavigate('pods', from, id)}
      >
        Pods
      </Button>
      <Button
        variant="outlined"
        color={currentPage === 'templatespage' ? 'secondary' : 'primary'}
        size="small"
        onClick={() => updateStateAndNavigate('templates', from, id)}
      >
        Templates
      </Button>
      <Button
        variant="outlined"
        color={currentPage === 'imagespage' ? 'secondary' : 'primary'}
        size="small"
        onClick={() => updateStateAndNavigate('images', from, id)}
      >
        Images
      </Button>
      <Button
        variant="outlined"
        color={currentPage === 'volumespage' ? 'secondary' : 'primary'}
        size="small"
        onClick={() => updateStateAndNavigate('volumes', from, id)}
      >
        Volumes
      </Button>
      <Button
        variant="outlined"
        color={currentPage === 'snapshotspage' ? 'secondary' : 'primary'}
        size="small"
        onClick={() => updateStateAndNavigate('snapshots', from, id)}
      >
        Snapshots
      </Button>
    </Stack>
  );
};

export default PodsNavigation;
