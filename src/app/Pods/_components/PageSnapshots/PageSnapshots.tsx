import React from 'react';
import { useState } from 'react';

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
import { LoadingButton } from '@mui/lab';
import { RefreshRounded } from '@mui/icons-material';
import { SectionMessage } from '@tapis/tapisui-common';

import { NavSnapshots } from 'app/Pods/_components';
import PodToolbar from 'app/Pods/_components/PodToolbar';
import { SnapshotWizard, SnapshotWizardEdit } from '../';
import { DeleteSnapshotModal, SnapshotPermissionModal } from '../Modals';
import { useHistory } from 'react-router-dom';
import { NavPods, PodsCodeMirror, PodsNavigation } from 'app/Pods/_components';
import PodsLoadingText from '../PodsLoadingText';
import { NavLink } from 'react-router-dom';
import { useAppSelector, updateState, useAppDispatch } from '@redux';

const PageSnapshots: React.FC<{ objId: string | undefined }> = ({ objId }) => {
  const dispatch = useAppDispatch();
  const { snapshotTab, snapshotRootTab } = useAppSelector(
    (state) => state.pods
  );

  const { data, isLoading, isFetching, error, invalidate } =
    Hooks.useGetSnapshot({ snapshotId: objId }, { enabled: !!objId });
  const {
    data: filesData,
    isLoading: isFilesLoading,
    isFetching: isFileFetching,
    error: filesError,
    invalidate: invalidateFiles,
  } = Hooks.useListSnapshotFiles({ snapshotId: objId }, { enabled: !!objId });
  const {
    data: dataPerms,
    isLoading: isLoadingPerms,
    isFetching: isFetchingPerms,
    error: errorPerms,
    invalidate: invalidatePerms,
  } = Hooks.useGetSnapshotPermissions(
    { snapshotId: objId },
    { enabled: !!objId }
  );

  const tooltipText =
    'Pods saves pod interactions in an Action Logs ledger. User and system interaction with your pod is logged here.';
  const pod: any | undefined = data?.result;
  const podPerms: Pods.VolumePermissionsResponse | undefined =
    dataPerms?.result as Pods.VolumePermissionsResponse | undefined;

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
      tooltipTitle: 'Snapshot Files',
      tooltipText: 'This is the list of files in this snapshot.',
    },
    perms: {
      tooltipTitle: 'Permissions',
      tooltipText: 'Permissions are the access control list for this snapshot.',
    },
  };

  const renderTooltipModal = () => {
    const config =
      tooltipConfigs[
        (objId === undefined ? snapshotRootTab : snapshotTab) ?? ''
      ];
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
      switch (snapshotRootTab) {
        case 'dashboard':
          return `Snapshots:
You can manage and create a point-in-time snapshot of a volume.
Said snapshots can be used in Pods as mounted storage.
Snapshots should generally be thought of as read-only.
 - Note that there's not yet limitations in place to manage read/write access.
 - Size limits are currently not enforced.

Select or create a snapshot to get started.`;
        case 'createSnapshot':
          return JSON.stringify(sharedData, null, 2);
        default:
          return ''; // Default or placeholder value
      }
    } else {
      switch (snapshotTab) {
        case 'details':
          return error
            ? `error: ${error}`
            : isFetching
            ? loadingText
            : JSON.stringify(pod, null, 2);
        case 'edit':
          return error
            ? `error: ${error}`
            : isFetching
            ? loadingText
            : JSON.stringify(pod, null, 2);
        case 'files':
          return filesError
            ? `error: ${filesError}`
            : isFileFetching
            ? loadingText
            : JSON.stringify(filesData, null, 2);
        case 'perms':
          return error
            ? `error: ${error}`
            : isFetching
            ? loadingText
            : JSON.stringify(podPerms, null, 2);

        default:
          return ''; // Default or placeholder value
      }
    }
  };

  const codeMirrorValue = getCodeMirrorValue();

  type ButtonConfig = {
    id: string;
    label: string;
    tabValue?: string; // Made optional to accommodate both uses
    icon?: JSX.Element;
    disabled?: boolean;
    customOnClick?: () => void;
  };

  const leftButtons: ButtonConfig[] = [
    {
      id: 'refresh',
      label: 'Refresh',
      icon: <RefreshRounded sx={{ height: '20px', maxWidth: '20px' }} />,
      customOnClick: () => {
        switch (snapshotTab) {
          case 'details':
            invalidate();
            break;
          case 'files':
            invalidateFiles();
            break;
          default:
            // Optionally handle any other cases or do nothing
            break;
        }
      },
    },
    { id: 'details', label: 'Details', tabValue: 'details' },
    { id: 'edit', label: 'Edit', tabValue: 'edit' },
    { id: 'files', label: 'Files', tabValue: 'files' },
    { id: 'perms', label: 'Perms', tabValue: 'perms' },
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
          id: 'createSnapshot',
          label: 'Create Snapshot',
          tabValue: 'createSnapshot',
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
        {leftButtons.map(
          ({ id, label, tabValue, customOnClick, icon, disabled }) => (
            <LoadingButton
              sx={{ minWidth: '10px' }}
              loading={id === 'refresh' && isFetching}
              key={id}
              variant="outlined"
              disabled={disabled}
              color={
                snapshotTab === tabValue || snapshotRootTab === tabValue
                  ? 'secondary'
                  : 'primary'
              }
              size="small"
              onClick={() => {
                invalidate();
                if (customOnClick) {
                  customOnClick();
                } else if (tabValue) {
                  if (objId === undefined) {
                    dispatch(updateState({ snapshotRootTab: tabValue }));
                  } else {
                    dispatch(updateState({ snapshotTab: tabValue }));
                  }
                }
              }}
            >
              {icon || label}
            </LoadingButton>
          )
        )}
      </Stack>
      <Stack spacing={2} direction="row">
        {snapshotTab === 'perms' && (
          <Button
            key="permissions"
            sx={{ minWidth: '10px' }}
            variant="outlined"
            color="primary"
            size="small"
            onClick={() => {
              setModal('podPermissions');
            }}
          >
            +
          </Button>
        )}

        {rightButtons.map(({ id, label, tabValue, customOnClick }) => (
          <Button
            key={id}
            variant="outlined"
            color={
              snapshotTab === tabValue || snapshotRootTab === tabValue
                ? 'secondary'
                : 'primary'
            }
            size="small"
            onClick={() => {
              if (customOnClick) {
                customOnClick();
              } else if (tabValue) {
                if (objId === undefined) {
                  dispatch(updateState({ snapshotRootTab: tabValue }));
                } else {
                  dispatch(updateState({ snapshotTab: tabValue }));
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
        <PodsNavigation from="snapshots" id={objId} />

        <Stack spacing={2} direction="row">
          <NavLink
            to="/pods/snapshots"
            className={styles['nav-link']}
            activeClassName={styles['active']}
            onClick={() =>
              dispatch(updateState({ snapshotRootTab: 'createSnapshot' }))
            }
          >
            <Button
              disabled={false}
              variant="outlined"
              size="small"
              aria-label="createSnapshot"
              className={styles['toolbar-btn']}
            >
              Create
            </Button>
          </NavLink>

          <Button
            disabled={false}
            variant="outlined"
            size="small"
            onClick={() => setModal('deleteSnapshot')}
            aria-label="deleteSnapshot"
            className={styles['toolbar-btn']}
          >
            Delete
          </Button>
        </Stack>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', overflow: 'auto' }}>
        <div style={{}} className={` ${styles['nav']} `}>
          <NavSnapshots />
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
                snapshotTab === 'edit'
                  ? JSON.stringify(sharedData, null, 2)
                  : ''
              }
              value={codeMirrorValue?.toString() ?? ''}
              isVisible={true}
              isEditorVisible={
                (snapshotTab === 'edit' && objId !== undefined) ||
                (snapshotRootTab === 'createSnapshot' && objId === undefined)
              }
              editPanel={
                snapshotTab === 'edit' && objId !== undefined ? (
                  <SnapshotWizardEdit
                    sharedData={sharedData}
                    setSharedData={setSharedData}
                  />
                ) : (
                  <SnapshotWizard
                    sharedData={sharedData}
                    setSharedData={setSharedData}
                  />
                )
              }
            />
          </div>
        </div>
        <div>{renderTooltipModal()}</div>
        {modal === 'deleteSnapshot' && <DeleteSnapshotModal toggle={toggle} />}
        {modal === 'podPermissions' && (
          <SnapshotPermissionModal toggle={toggle} />
        )}
      </div>
    </div>
  );
};

export default PageSnapshots;
