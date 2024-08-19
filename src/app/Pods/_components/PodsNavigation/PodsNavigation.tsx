import React, { useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { usePodsContext } from '../PodsContext';
import { Stack } from '@mui/material';
import { Button } from '@mui/material';

interface PodsNavigationProps {
  from?: 'pods' | 'templates' | 'images';
  id?: string;
  podTab?: string;
}

const PodsNavigation: React.FC<PodsNavigationProps> = ({
  from,
  id,
  podTab,
}) => {
  const history = useHistory();
  const {
    lastPodId,
    lastPodTab,
    lastVolumeId,
    lastSnapshotId,
    lastTemplateId,
    lastImageId,
    currentPage,
    setIds,
  } = usePodsContext();

  const setPageTab = (
    destination: 'pods' | 'templates' | 'images' | 'volumes' | 'snapshots',
    from?: string,
    id?: string,
    podTab?: string
  ) => {
    console.log('lastPodId:', lastPodId);
    console.log('from:', from);
    console.log('currentPage', currentPage);
    console.log('id:', id);
    console.log('lastPodTab:', lastPodTab);

    if (id) {
      switch (from) {
        case 'pods':
          console.log('podTab --------:', podTab);
          if (podTab) {
            console.log('Setting lastPodId:', id, 'lastPodTab:', lastPodTab);
            setIds({ lastPodId: id });
            setIds({ lastPodTab: podTab });
            console.log('set lastPodId:', id, 'lastPodTab:', lastPodTab);
            break;
          } else
            console.log('Setting lastPodId:', id, 'lastPodTab:', lastPodTab);
          setIds({ lastPodId: id });
          console.log('set lastPodId:', id, 'lastPodTab:', lastPodTab);
          break;
        case 'templates':
          setIds({ lastTemplateId: id });
          break;
        case 'images':
          setIds({ lastImageId: id });
          break;
        default:
          console.warn('Unexpected from:', from);
      }
    }

    switch (destination) {
      case 'pods':
        // If podId is available, navigate to /pods/:podId, else navigate to /pods
        lastPodId ? history.push(`/pods/${lastPodId}`) : history.push('/pods');
        setIds({ currentPage: 'podspage' });
        break;
      case 'templates':
        lastImageId
          ? history.push(`/pods/templates/${lastTemplateId}`)
          : history.push('/pods/templates');
        setIds({ currentPage: 'templatespage' });
        break;
      case 'images':
        lastImageId
          ? history.push(`/pods/images/${lastImageId}`)
          : history.push('/pods/images');
        setIds({ currentPage: 'imagespage' });
        break;
      case 'volumes':
        lastVolumeId
          ? history.push(`/pods/volumes/${lastVolumeId}`)
          : history.push('/pods/volumes');
        setIds({ currentPage: 'volumespage' });
        break;
      case 'snapshots':
        lastSnapshotId
          ? history.push(`/pods/snapshots/${lastSnapshotId}`)
          : history.push('/pods/snapshots');
        setIds({ currentPage: 'snapshotspage' });
        break;
      default:
        console.warn('Unexpected destination:', destination);
    }
  };

  return (
    <Stack spacing={2} direction="row">
      <Button
        //startIcon={<Info />}
        variant="outlined"
        color={currentPage === 'podspage' ? 'secondary' : 'primary'}
        size="small"
        onClick={() => {
          setPageTab('pods', from, id);
        }}
      >
        Pods
      </Button>
      <Button
        //startIcon={<CompareArrows />}
        variant="outlined"
        size="small"
        color={currentPage === 'templatespage' ? 'secondary' : 'primary'}
        onClick={() => {
          setPageTab('templates', from, id);
        }}
      >
        Templates
      </Button>
      <Button
        //startIcon={<Tune />}
        variant="outlined"
        size="small"
        color={currentPage === 'imagespage' ? 'secondary' : 'primary'}
        onClick={() => {
          setPageTab('images', from, id);
        }}
      >
        Images
      </Button>
      <Button
        //startIcon={<CompareArrows />}
        variant="outlined"
        size="small"
        color={currentPage === 'volumespage' ? 'secondary' : 'primary'}
        onClick={() => {
          setPageTab('volumes', from, id);
        }}
      >
        Volumes
      </Button>
      <Button
        //startIcon={<CompareArrows />}
        variant="outlined"
        size="small"
        color={currentPage === 'snapshotspage' ? 'secondary' : 'primary'}
        onClick={() => {
          setPageTab('snapshots', from, id);
        }}
      >
        Snapshots
      </Button>
    </Stack>
  );
};

export default PodsNavigation;
