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

import { NavVolumes } from 'app/Pods/_components';
import PodToolbar from 'app/Pods/_components/PodToolbar';
import { VolumeWizard, VolumeWizardEdit } from '../';
import { DeleteVolumeModal, VolumePermissionModal } from '../Modals';
import { useHistory } from 'react-router-dom';
import { NavPods, PodsCodeMirror, PodsNavigation } from 'app/Pods/_components';
import PodsLoadingText from '../PodsLoadingText';
import { set } from 'date-fns';
import { NavLink } from 'react-router-dom';

import { useAppSelector, updateState, useAppDispatch } from '@redux';

const PageVolumes: React.FC<{ objId: string | undefined }> = ({ objId }) => {
  const dispatch = useAppDispatch();
  const { volumeTab, volumeRootTab } = useAppSelector((state) => state.pods);

  const { data, isLoading, isFetching, error, invalidate } = Hooks.useGetVolume(
    { volumeId: objId },
    { enabled: !!objId }
  );
  const {
    data: filesData,
    isLoading: isFilesLoading,
    isFetching: isFileFetching,
    error: filesError,
    invalidate: invalidateFiles,
  } = Hooks.useListVolumeFiles({ volumeId: objId }, { enabled: !!objId });
  const {
    data: dataPerms,
    isLoading: isLoadingPerms,
    isFetching: isFetchingPerms,
    error: errorPerms,
    invalidate: invalidatePerms,
  } = Hooks.useGetVolumePermissions({ volumeId: objId }, { enabled: !!objId });

  const {
    deleteVolume: deleteVolumePermission,
    isLoading: isDeletingVolumePermission,
  } = Hooks.useDeleteVolumePermission();

  const tooltipText =
    'Pods saves pod interactions in an Action Logs ledger. User and system interaction with your pod is logged here.';
  const pod: any | undefined = data?.result;
  const podPerms: Pods.VolumePermissionsResponse | undefined =
    dataPerms?.result as Pods.VolumePermissionsResponse | undefined;

  const [modal, setModal] = useState<string | undefined>(undefined);
  const toggle = () => {
    setModal(undefined);
  };

  const handleDeleteVolumePermission = (user: string) => {
    if (!objId) return;
    deleteVolumePermission(
      { volumeId: objId, user },
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
      tooltipTitle: 'Volume Files',
      tooltipText: 'This is the list of files in this volume.',
    },
    perms: {
      tooltipTitle: 'Permissions',
      tooltipText: 'Permissions are the access control list for this Volume.',
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
Said volumes can be used in Pods as mounted persistent storage.
Snapshots of volumes can be managed on the snapshots page.
 - Volume size limits are currently not enforced.

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
        switch (volumeTab) {
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

  // Track if perms tab ButtonGroup already rendered (to skip default rendering)
  const permsHandledInButtonGroup = true;

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
            if (id === 'edit' && volumeTab === 'edit') {
              return (
                <ButtonGroup
                  key="edit-group"
                  variant="outlined"
                  size="small"
                  sx={{ height: '32px' }}
                >
                  <Button
                    onClick={() => {
                      dispatch(updateState({ volumeTab: 'details' }));
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
                      color={volumeTab === 'perms' ? 'secondary' : 'primary'}
                      onClick={() => {
                        invalidatePerms();
                        dispatch(updateState({ volumeTab: 'perms' }));
                      }}
                    >
                      Perms
                    </LoadingButton>
                    {volumeTab === 'perms' && (
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
                  volumeTab === tabValue || volumeRootTab === tabValue
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
                      dispatch(updateState({ volumeRootTab: tabValue }));
                    } else {
                      dispatch(updateState({ volumeTab: tabValue }));
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
              volumeTab === tabValue || volumeRootTab === tabValue
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
            {/* Permissions chips when viewing perms */}
            {volumeTab === 'perms' && objId !== undefined && (
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
                          onDelete={() => handleDeleteVolumePermission(user)}
                          disabled={isDeletingVolumePermission}
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
            {volumeTab === 'edit' && objId !== undefined ? (
              <VolumeWizardEdit key={objId} volume={pod} />
            ) : volumeRootTab === 'createVolume' && objId === undefined ? (
              <VolumeWizard
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
        {modal === 'deleteVolume' && <DeleteVolumeModal toggle={toggle} />}
        {modal === 'podPermissions' && (
          <VolumePermissionModal toggle={toggle} />
        )}
      </div>
    </div>
  );
};

export default PageVolumes;
