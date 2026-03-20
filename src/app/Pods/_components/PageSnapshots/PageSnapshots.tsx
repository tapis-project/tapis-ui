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
import { Stack, Chip, Box, Typography } from '@mui/material';
import {
  CopyButton,
  TooltipModal,
  DescriptionList,
  Tabs,
  JSONDisplay,
  QueryWrapper,
} from '@tapis/tapisui-common';
import styles from '../Pages.module.scss';
import { Button, ButtonGroup } from '@mui/material';
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
  const podPerms: Pods.SnapshotPermissionsResponse | undefined =
    dataPerms?.result as Pods.SnapshotPermissionsResponse | undefined;

  const {
    deleteSnapshot: deleteSnapshotPermission,
    isLoading: isDeletingSnapshotPermission,
  } = Hooks.useDeleteSnapshotPermission();

  const [modal, setModal] = useState<string | undefined>(undefined);
  const toggle = () => {
    setModal(undefined);
  };

  const handleDeleteSnapshotPermission = (user: string) => {
    if (!objId) return;
    deleteSnapshotPermission(
      { snapshotId: objId, user },
      {
        onSuccess: () => {
          invalidatePerms();
        },
      }
    );
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
          return errorPerms
            ? `error: ${errorPerms}`
            : isFetchingPerms
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
        overflowX: 'auto',
        overflowY: 'hidden',
        flexWrap: 'nowrap',
        flexShrink: 0,
      }}
    >
      <Stack
        spacing={2}
        direction="row"
        sx={{ flexShrink: 0, flexWrap: 'nowrap' }}
      >
        {leftButtons.map(
          ({ id, label, tabValue, customOnClick, icon, disabled }) => {
            if (id === 'edit' && snapshotTab === 'edit') {
              return (
                <ButtonGroup
                  key="edit-group"
                  variant="outlined"
                  size="small"
                  sx={{ height: '32px' }}
                >
                  <Button
                    onClick={() => {
                      dispatch(updateState({ snapshotTab: 'details' }));
                    }}
                    color="error"
                    sx={{
                      minWidth: '28px !important',
                      width: '28px',
                      p: 0,
                      borderRight: '1px solid rgba(0,0,0,0.12)',
                    }}
                    variant="outlined"
                  >
                    x
                  </Button>
                  <Button
                    color="secondary"
                    sx={{ minWidth: '60px', whiteSpace: 'nowrap' }}
                    variant="outlined"
                  >
                    Edit
                  </Button>
                </ButtonGroup>
              );
            }
            if (id === 'perms') {
              return (
                <React.Fragment key="perms-split">
                  <ButtonGroup variant="outlined" size="small">
                    <LoadingButton
                      sx={{ minWidth: '60px', whiteSpace: 'nowrap' }}
                      variant="outlined"
                      color={snapshotTab === 'perms' ? 'secondary' : 'primary'}
                      onClick={() => {
                        invalidatePerms();
                        dispatch(updateState({ snapshotTab: 'perms' }));
                      }}
                    >
                      Perms
                    </LoadingButton>
                    {snapshotTab === 'perms' && (
                      <Button
                        onClick={() => {
                          setModal('podPermissions');
                        }}
                        color="primary"
                        sx={{
                          fontSize: '14px',
                          minWidth: '28px !important',
                          width: '28px',
                        }}
                        variant="outlined"
                      >
                        +
                      </Button>
                    )}
                  </ButtonGroup>
                </React.Fragment>
              );
            }
            return (
              <LoadingButton
                sx={{ minWidth: '10px', whiteSpace: 'nowrap' }}
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
            );
          }
        )}
      </Stack>
      <Stack
        spacing={2}
        direction="row"
        sx={{ flexShrink: 0, flexWrap: 'nowrap', ml: 2 }}
      >
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
            sx={{ whiteSpace: 'nowrap' }}
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
            {/* Permissions chips when viewing perms */}
            {snapshotTab === 'perms' && objId !== undefined && (
              <Box sx={{ px: 1, py: 1, mb: 1 }}>
                {isFetchingPerms ? (
                  <Typography variant="body2" color="text.secondary">
                    Loading permissions...
                  </Typography>
                ) : errorPerms ? (
                  <Typography variant="body2" color="error">
                    Error loading permissions
                  </Typography>
                ) : podPerms && typeof podPerms === 'object' ? (
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1,
                      alignItems: 'center',
                    }}
                  >
                    {(() => {
                      const permsData = podPerms.permissions ?? podPerms;
                      const entries: [string, string][] = Array.isArray(
                        permsData
                      )
                        ? permsData.map((entry: string) => {
                            const parts = entry.split(':');
                            return [parts[0], parts.slice(1).join(':')] as [
                              string,
                              string
                            ];
                          })
                        : Object.entries(permsData);
                      if (entries.length === 0) {
                        return (
                          <Typography variant="body2" color="text.secondary">
                            No permissions set
                          </Typography>
                        );
                      }
                      return entries.map(([user, level]) => (
                        <Chip
                          key={user}
                          label={`${user}:${level}`}
                          size="small"
                          variant="outlined"
                          onDelete={() => handleDeleteSnapshotPermission(user)}
                          disabled={isDeletingSnapshotPermission}
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: '0.8rem',
                            borderRadius: 1,
                            ...(level === 'ADMIN' || level === 'APPROVEDADMIN'
                              ? {
                                  borderColor: '#9c27b0',
                                  color: '#9c27b0',
                                  '& .MuiChip-deleteIcon': { color: '#9c27b0' },
                                }
                              : level === 'USER'
                              ? {
                                  borderColor: '#9e9e9e',
                                  color: '#9e9e9e',
                                  '& .MuiChip-deleteIcon': { color: '#9e9e9e' },
                                }
                              : {}),
                          }}
                        />
                      ));
                    })()}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No permissions data available
                  </Typography>
                )}
              </Box>
            )}
            {snapshotTab === 'edit' && objId !== undefined ? (
              <SnapshotWizardEdit key={objId} snapshot={pod} />
            ) : snapshotRootTab === 'createSnapshot' && objId === undefined ? (
              <SnapshotWizard
                sharedData={sharedData}
                setSharedData={setSharedData}
              />
            ) : (
              <PodsCodeMirror
                editValue=""
                value={codeMirrorValue?.toString() ?? ''}
                isVisible={true}
                isEditorVisible={false}
              />
            )}
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
