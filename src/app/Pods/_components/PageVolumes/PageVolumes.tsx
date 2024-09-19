import React from 'react';
import { useState, useEffect, useRef } from 'react';

import { Pods as Hooks } from '@tapis/tapisui-hooks';
import { Pods } from '@tapis/tapis-typescript';
import {
  PageLayout,
  LayoutBody,
  LayoutNavWrapper,
} from '@tapis/tapisui-common';

import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { vscodeDark, vscodeDarkInit } from '@uiw/codemirror-theme-vscode';
import { decode } from 'base-64';
import { Stack } from '@mui/material';
import {
  CopyButton,
  TooltipModal,
  DescriptionList,
  Tabs,
  JSONDisplay,
  QueryWrapper,
} from '@tapis/tapisui-common';
import styles from '../Pages.module.scss';
import { Button } from '@mui/material';
import { SectionMessage } from '@tapis/tapisui-common';

import { NavVolumes } from 'app/Pods/_components';
import PodToolbar from 'app/Pods/_components/PodToolbar';
import { VolumeWizard, VolumeWizardEdit } from '../';
import { DeleteVolumeModal } from '../Modals';
import { useHistory } from 'react-router-dom';
import { NavPods, PodsCodeMirror, PodsNavigation } from 'app/Pods/_components';
import PodsLoadingText from '../PodsLoadingText';
import { set } from 'date-fns';
import { NavLink } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { updateState } from '../../redux/podsSlice';

const PageVolumes: React.FC<{ objId: string | undefined }> = ({ objId }) => {
  const dispatch = useDispatch();
  const navigate = useHistory();
  const { volumeTab, volumeRootTab } = useSelector(
    (state: RootState) => state.pods
  );

  const { data, isLoading, error } = Hooks.useGetVolume({ volumeId: objId });
  const {
    data: filesData,
    isLoading: isFilesLoading,
    error: filesError,
  } = Hooks.useListVolumeFiles({ volumeId: objId });

  const tooltipText =
    'Pods saves pod interactions in an Action Logs ledger. User and system interaction with your pod is logged here.';
  const pod: any | undefined = data?.result;

  const [modal, setModal] = useState<string | undefined>(undefined);
  const toggle = () => {
    setModal(undefined);
  };

  const loadingText = PodsLoadingText();

  const tooltipConfigs: {
    [key: string]: { tooltipTitle: string; tooltipText: string };
  } = {
    details: {
      tooltipTitle: 'Pod Definition',
      tooltipText:
        'This is the JSON definition of this Pod. Visit our live-docs for an exact schema: https://tapis-project.github.io/live-docs/?service=Pods',
    },
    files: {
      tooltipTitle: 'Volume Files',
      tooltipText: 'This is the list of files in this volume.',
    },
  };

  const renderTooltipModal = () => {
    const config =
      tooltipConfigs[(objId === undefined ? volumeRootTab : volumeTab) ?? ''];
    if (config && modal === 'tooltip') {
      return (
        <TooltipModal
          toggle={toggle}
          tooltipTitle={config.tooltipTitle}
          tooltipText={config.tooltipText}
        />
      );
    }
    return null;
  };

  const [sharedData, setSharedData] = useState({});

  const getCodeMirrorValue = () => {
    if (objId === undefined) {
      switch (volumeRootTab) {
        case 'dashboard':
          return `Volumes:
You can manage and create volumes here.
Said volumes can be used in Pods as persistent storage.
Snapshots of volumes can be managed on the snapshots page.
Select or create a volume to get started.`;
        case 'createVolume':
          return JSON.stringify(sharedData, null, 2);
        default:
          return ''; // Default or placeholder value
      }
    } else {
      switch (volumeTab) {
        case 'details':
          return error
            ? `error: ${error}`
            : isLoading
            ? loadingText
            : JSON.stringify(pod, null, 2);
        case 'edit':
          return error
            ? `error: ${error}`
            : isLoading
            ? loadingText
            : JSON.stringify(pod, null, 2);
        case 'files':
          return filesError
            ? `error: ${filesError}`
            : isFilesLoading
            ? loadingText
            : JSON.stringify(filesData, null, 2);
        default:
          return ''; // Default or placeholder value
      }
    }
  };
  const codeMirrorValue = getCodeMirrorValue();

  type ButtonConfig = {
    id: string;
    label: string;
    tabValue?: string;
    customOnClick?: () => void;
  };

  const leftButtons: ButtonConfig[] = [
    { id: 'details', label: 'Details', tabValue: 'details' },
    { id: 'edit', label: 'Edit', tabValue: 'edit' },
    { id: 'files', label: 'Files', tabValue: 'files' },
  ];

  const rightButtons: ButtonConfig[] = [
    {
      id: 'help',
      label: 'Help',
      customOnClick: () => setModal('tooltip'),
    },
    {
      id: 'copy',
      label: 'Copy',
      customOnClick: () =>
        navigator.clipboard.writeText(getCodeMirrorValue() ?? ''),
    },
  ];

  const getTabBarButtons = () => {
    if (objId === undefined) {
      return [
        { id: 'dashboard', label: 'Dashboard', tabValue: 'dashboard' },
        {
          id: 'createVolume',
          label: 'Create Volume',
          tabValue: 'createVolume',
        },
      ];
    }
    return leftButtons;
  };

  const renderTabBar = (
    leftButtons: ButtonConfig[],
    rightButtons: ButtonConfig[]
  ) => (
    <div
      style={{
        paddingBottom: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Stack spacing={2} direction="row">
        {leftButtons.map(({ id, label, tabValue, customOnClick }) => (
          <Button
            key={id}
            variant="outlined"
            color={
              volumeTab === tabValue || volumeRootTab === tabValue
                ? 'secondary'
                : 'primary'
            }
            size="small"
            onClick={() => {
              if (customOnClick) {
                customOnClick();
              } else if (tabValue) {
                if (objId === undefined) {
                  dispatch(updateState({ volumeRootTab: tabValue }));
                } else {
                  dispatch(updateState({ volumeTab: tabValue }));
                }
              }
            }}
          >
            {label}
          </Button>
        ))}
      </Stack>
      <Stack spacing={2} direction="row">
        {rightButtons.map(({ id, label, tabValue, customOnClick }) => (
          <Button
            key={id}
            variant="outlined"
            color={
              volumeTab === tabValue || volumeRootTab === tabValue
                ? 'secondary'
                : 'primary'
            }
            size="small"
            onClick={() => {
              if (customOnClick) {
                customOnClick();
              } else if (tabValue) {
                if (objId === undefined) {
                  dispatch(updateState({ volumeRootTab: tabValue }));
                } else {
                  dispatch(updateState({ volumeTab: tabValue }));
                }
              }
            }}
          >
            {label}
          </Button>
        ))}
      </Stack>
    </div>
  );

  return (
    <div>
      <div
        style={{
          paddingTop: '.4rem',
          borderBottom: '1px solid rgba(112, 112, 112, 0.25)',
          paddingBottom: '.4rem',
          paddingLeft: '1rem',
          paddingRight: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection: 'row',
          overflow: 'auto',
        }}
      >
        <PodsNavigation from="volumes" id={objId} />

        <Stack spacing={2} direction="row">
          <NavLink
            to="/pods/volumes"
            className={styles['nav-link']}
            activeClassName={styles['active']}
            onClick={() =>
              dispatch(updateState({ volumeRootTab: 'createVolume' }))
            }
          >
            <Button
              disabled={false}
              variant="outlined"
              size="small"
              aria-label="createVolume"
              className={styles['toolbar-btn']}
            >
              Create
            </Button>
          </NavLink>

          <Button
            disabled={false}
            variant="outlined"
            size="small"
            onClick={() => setModal('deleteVolume')}
            aria-label="deleteVolume"
            className={styles['toolbar-btn']}
          >
            Delete
          </Button>
        </Stack>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', overflow: 'auto' }}>
        <div style={{}} className={` ${styles['nav']} `}>
          <NavVolumes />
        </div>
        <div
          style={{
            margin: '1rem',
            flex: 1,
            overflow: 'auto',
          }}
        >
          {renderTabBar(getTabBarButtons(), rightButtons)}
          <div className={styles['container']}>
            <PodsCodeMirror
              editValue={
                volumeTab === 'edit' ? JSON.stringify(sharedData, null, 2) : ''
              }
              value={codeMirrorValue?.toString() ?? ''}
              isVisible={true}
              isEditorVisible={
                (volumeTab === 'edit' && objId !== undefined) ||
                (volumeRootTab === 'createVolume' && objId === undefined)
              }
              editPanel={
                volumeTab === 'edit' && objId !== undefined ? (
                  <VolumeWizardEdit
                    sharedData={sharedData}
                    setSharedData={setSharedData}
                  />
                ) : (
                  <VolumeWizard
                    sharedData={sharedData}
                    setSharedData={setSharedData}
                  />
                )
              }
            />
          </div>
        </div>
        <div>{renderTooltipModal()}</div>
        {modal === 'deleteVolume' && <DeleteVolumeModal toggle={toggle} />}
      </div>
    </div>
  );
};

export default PageVolumes;
