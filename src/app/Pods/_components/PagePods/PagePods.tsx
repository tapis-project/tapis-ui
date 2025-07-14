import React from 'react';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
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
import { Stack, Button, Tooltip } from '@mui/material';
import {
  CopyButton,
  TooltipModal,
  DescriptionList,
  Tabs,
  JSONDisplay,
  QueryWrapper,
} from '@tapis/tapisui-common';
import styles from '../Pages.module.scss';
import { LoadingButton } from '@mui/lab';
import { RefreshRounded, ArrowDropDown } from '@mui/icons-material';
import { SectionMessage } from '@tapis/tapisui-common';
import {
  ClickAwayListener,
  Grow,
  Paper,
  Popper,
  MenuItem,
  MenuList,
} from '@mui/material';

import PodToolbar from 'app/Pods/_components/PodToolbar';
import { PodWizard, PodWizardEdit } from '../';
import { PodPermissionModal } from '../Modals';
import { NavPods, PodsCodeMirror, PodsNavigation } from 'app/Pods/_components';
import PodsLoadingText from '../PodsLoadingText';
import { useAppSelector, updateState, useAppDispatch } from '@redux';
import ButtonGroup from '@mui/material/ButtonGroup';

const PagePods: React.FC<{ objId: string | undefined }> = ({ objId }) => {
  const dispatch = useAppDispatch();
  const {
    podTab,
    podRootTab,
    podEditTab,
    podDetailTab,
    createPodData,
    podLogTab,
    setDetailsDropdownOpen,
    setLogsDropdownOpen,
    templateNavExpandedItems,
  } = useAppSelector((state) => state.pods);
  const history = useHistory();

  // Add missing refs for dropdown anchors
  const detailsAnchorRef = React.useRef<HTMLDivElement>(null);
  const logsAnchorRef = React.useRef<HTMLDivElement>(null);

  const { data, isLoading, isFetching, error, invalidate } = Hooks.useGetPod(
    { podId: objId },
    { enabled: !!objId }
  );
  const {
    data: dataLogs,
    isLoading: isLoadingLogs,
    isFetching: isFetchingLogs,
    error: errorLogs,
    invalidate: invalidateLogs,
  } = Hooks.useGetPodLogs({ podId: objId }, { enabled: !!objId });
  const {
    data: dataSecrets,
    isLoading: isLoadingSecrets,
    isFetching: isFetchingSecrets,
    error: errorSecrets,
    invalidate: invalidateSecrets,
  } = Hooks.useGetPodSecrets({ podId: objId }, { enabled: !!objId });
  const {
    data: dataPerms,
    isLoading: isLoadingPerms,
    isFetching: isFetchingPerms,
    error: errorPerms,
    invalidate: invalidatePerms,
  } = Hooks.useGetPodPermissions({ podId: objId }, { enabled: !!objId });
  const {
    data: dataDerived,
    isLoading: isLoadingDerived,
    isFetching: isFetchingDerived,
    error: errorDerived,
    invalidate: invalidateDerived,
  } = Hooks.useGetPodDerived({ podId: objId }, { enabled: !!objId });

  const tooltipText =
    'Pods saves pod interactions in an Action Logs ledger. User and system interaction with your pod is logged here.';
  const pod: Pods.PodResponseModel | undefined = data?.result;
  // If no template, details tab is default
  useEffect(() => {
    if (pod !== undefined) {
      //console.log('Pod data is available:', objId);
      if (pod?.template) {
        dispatch(updateState({ podDetailTab: 'derived' }));
        //console.log('Pod has template, setting podDetailTab to derived');
      } else {
        dispatch(updateState({ podDetailTab: 'details' }));
        //console.log('Pod has no template, setting podDetailTab to details');
      }
    }
  }, [objId, pod?.template]); // Trigger on objId change, not pod change
  const podDerived: Pods.PodResponseModel | undefined = dataDerived?.result;
  const podLogs: Pods.LogsModel | undefined = dataLogs?.result;
  const podSecrets: Pods.CredentialsModel | undefined = dataSecrets?.result;
  const podPerms: Pods.PodPermissionsResponse | undefined =
    dataPerms?.result as Pods.PodPermissionsResponse | undefined;

  // State to control the visibility of the TooltipModal
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
    derived: {
      tooltipTitle: 'Derived Pod Definition',
      tooltipText:
        'This is the derived JSON definition of this Pod. Deriving info from templates recursively. Visit our live-docs for an exact schema: https://tapis-project.github.io/live-docs/?service=Pods',
    },
    actionlogs: {
      tooltipTitle: 'Action Logs',
      tooltipText:
        'Pods saves pod interactions in an Action Logs ledger. User and system interaction with your pod is logged here.',
    },
    logs: {
      tooltipTitle: 'Logs',
      tooltipText:
        'Logs contain the stdout/stderr of the most recent Pod run. Use it to debug your pod during startup, to grab metrics, inspect logs, and output data from your Pod.',
    },
    secrets: {
      tooltipTitle: 'Secrets',
      tooltipText:
        'Secrets are variables that you can reference via $SECRET_KEY. WIP',
    },
    perms: {
      tooltipTitle: 'Permissions',
      tooltipText: 'Permissions are the access control list for this Pod. WIP',
    },
  };

  const renderTooltipModal = () => {
    let configKey = (objId === undefined ? podRootTab : podTab) ?? '';
    // Use podDetailTab or podLogTab for details/logs
    if (objId !== undefined) {
      if (podTab === 'details') {
        configKey = podDetailTab ?? 'details';
      } else if (podTab === 'logs') {
        configKey = podLogTab === 'actions' ? 'actionlogs' : 'logs';
      }
    }
    const config = tooltipConfigs[configKey];
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

  const getCodeMirrorValue = () => {
    if (objId === undefined) {
      switch (podRootTab) {
        case 'dashboard':
          return `Pods:
You can manage and create pods here.
The Pods Service provides an API to manage Kubernetes pods.
The service manages pods, certificates, proxying, and more.
The output of the service is a encrypted, networked, Kubernetes pod.

Select or create a pod to get started.`;
        case 'createPod':
          return JSON.stringify(createPodData, null, 2);
        default:
          return ''; // Default or placeholder value
      }
    } else {
      switch (podTab) {
        case 'details':
        case 'edit':
          switch (podDetailTab) {
            case 'derived':
              return error
                ? `error: ${error}`
                : isFetchingDerived
                ? loadingText
                : JSON.stringify(podDerived, null, 2);
            case 'details':
              return error
                ? `error: ${error}`
                : isFetching
                ? loadingText
                : JSON.stringify(pod, null, 2);
            default:
              return ''; // Default or placeholder value
          }
        case 'logs':
          switch (podLogTab) {
            case 'logs':
              return error
                ? `error: ${errorLogs}`
                : isFetchingLogs
                ? loadingText
                : podLogs?.logs
                ? podLogs.logs
                : 'No logs available from this pod yet.';
            case 'actions':
              return error
                ? `error: ${errorLogs}`
                : isFetchingLogs
                ? loadingText
                : podLogs?.action_logs?.join('\n');
            default:
              return ''; // Default or placeholder value
          }
        case 'secrets':
          return error
            ? `error: ${errorSecrets}`
            : isFetchingSecrets
            ? loadingText
            : JSON.stringify(podSecrets, null, 2);
        case 'perms':
          return error
            ? `error: ${error}`
            : isFetchingPerms
            ? loadingText
            : JSON.stringify(podPerms, null, 2);
        default:
          return ''; // Default or placeholder value
      }
    }
  };

  const codeMirrorValue = getCodeMirrorValue();

  const networkingObj = (data?.result?.networking ?? {})['default'];
  const networkingProtocol = networkingObj?.protocol;
  var networkingUrl = (networkingObj?.url as string | undefined) ?? undefined;
  const tapisUiUriRedirect = networkingObj?.tapis_ui_uri_redirect ?? false;
  const tapisUIUri = networkingObj?.tapis_ui_uri ?? '';
  // add tapisUIUriRedirect to the networkingUrl if both exist
  // console.log(
  //   'networkingurl and object',
  //   networkingUrl,
  //   tapisUiUriRedirect,
  //   tapisUIUri,
  //   networkingObj,
  //   data?.result?.networking
  // );
  if (
    networkingUrl &&
    tapisUiUriRedirect &&
    tapisUIUri &&
    networkingProtocol === 'http'
  ) {
    networkingUrl = `${networkingUrl}${tapisUIUri}`;
  }
  const podStatus = data?.result?.status;
  const podDerivedStatus = dataDerived?.result?.status;

  // Dashboard view button lists
  const dashboardLeftButtons = [
    <Button
      key="dashboard"
      variant="outlined"
      size="small"
      color={podRootTab === 'dashboard' ? 'secondary' : 'primary'}
      onClick={() => dispatch(updateState({ podRootTab: 'dashboard' }))}
    >
      Dashboard
    </Button>,
    podRootTab !== 'createPod' ? (
      <Button
        key="createPod"
        variant="outlined"
        size="small"
        color={podRootTab === 'createPod' ? 'secondary' : 'primary'}
        onClick={() => dispatch(updateState({ podRootTab: 'createPod' }))}
      >
        Create Pod
      </Button>
    ) : (
      <ButtonGroup
        key="createPod-group"
        variant="outlined"
        size="small"
        sx={{ height: '32px' }}
      >
        <Button
          onClick={() => {
            dispatch(updateState({ podRootTab: 'dashboard' }));
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
          onClick={() => {
            dispatch(
              updateState({ podRootTab: 'createPod', podEditTab: 'form' })
            );
          }}
          color={podEditTab === 'form' ? 'secondary' : 'primary'}
          sx={{ minWidth: '60px' }}
          variant={podEditTab === 'form' ? 'outlined' : 'outlined'}
        >
          form
        </Button>
        <Button
          onClick={() => {
            dispatch(
              updateState({ podRootTab: 'createPod', podEditTab: 'json' })
            );
          }}
          color={podEditTab === 'json' ? 'secondary' : 'primary'}
          sx={{ minWidth: '60px' }}
          variant={podEditTab === 'json' ? 'outlined' : 'outlined'}
        >
          json
        </Button>
      </ButtonGroup>
    ),
  ];
  const dashboardRightButtons = [
    <Button
      key="help"
      variant="outlined"
      size="small"
      onClick={() => setModal('tooltip')}
    >
      Help
    </Button>,
  ];

  // Details view button lists (with split/popover button objects as React elements)
  const detailsLeftButtons = [
    <LoadingButton
      key="refresh"
      sx={{ minWidth: '10px' }}
      loading={isFetching || isFetchingLogs || isFetchingSecrets}
      variant="outlined"
      color="primary"
      size="small"
      onClick={() => {
        switch (podTab) {
          case 'edit':
          case 'details':
            switch (podDetailTab) {
              case 'details':
                invalidate();
                break;
              case 'derived':
                invalidateDerived();
                break;
            }
            break;
          case 'logs':
            invalidateLogs();
            break;
          case 'perms':
            invalidatePerms();
            break;
          case 'secrets':
            invalidateSecrets();
            break;
          default:
            // Optionally handle any other cases or do nothing
            break;
        }
      }}
    >
      <RefreshRounded sx={{ height: '20px', maxWidth: '20px' }} />
    </LoadingButton>,
    podTab !== 'edit' ? (
      <Button
        key="edit"
        variant="outlined"
        color="primary"
        size="small"
        onClick={() => {
          dispatch(updateState({ podTab: 'edit' }));
        }}
        sx={{ minWidth: '60px', height: '32px' }}
      >
        Edit
      </Button>
    ) : (
      <ButtonGroup
        key="edit-group"
        variant="outlined"
        size="small"
        sx={{ height: '32px' }}
      >
        <Button
          onClick={() => {
            dispatch(updateState({ podTab: 'details' }));
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
          onClick={() => {
            dispatch(updateState({ podTab: 'edit', podEditTab: 'form' }));
          }}
          color={podEditTab === 'form' ? 'secondary' : 'primary'}
          sx={{ minWidth: '60px' }}
          variant={podEditTab === 'form' ? 'outlined' : 'outlined'}
        >
          form
        </Button>
        <Button
          onClick={() => {
            dispatch(updateState({ podTab: 'edit', podEditTab: 'json' }));
          }}
          color={podEditTab === 'json' ? 'secondary' : 'primary'}
          sx={{ minWidth: '60px' }}
          variant={podEditTab === 'json' ? 'outlined' : 'outlined'}
        >
          json
        </Button>
      </ButtonGroup>
    ),
    // Details/Derived split button (MUI SplitButton pattern)
    <React.Fragment key="details-split">
      <ButtonGroup variant="outlined" size="small" ref={detailsAnchorRef}>
        <LoadingButton
          sx={{ minWidth: '60px' }}
          variant="outlined"
          color={
            podTab === 'edit' || podTab === 'derived' || podTab === 'details'
              ? 'secondary'
              : 'primary'
          }
          onClick={() => {
            invalidate();
            dispatch(updateState({ podTab: 'details' }));
          }}
        >
          {podDetailTab}
        </LoadingButton>
        {objId !== undefined && pod?.template && (
          <Button
            onClick={() =>
              dispatch(
                updateState({ setDetailsDropdownOpen: !setDetailsDropdownOpen })
              )
            }
            color={
              podTab === 'edit' || podTab === 'derived' || podTab === 'details'
                ? 'secondary'
                : 'primary'
            }
            sx={{
              fontSize: '14px',
              minWidth: '28px !important',
              width: '28px',
            }}
            variant="outlined"
            aria-controls={setDetailsDropdownOpen ? 'details-menu' : undefined}
            aria-expanded={setDetailsDropdownOpen ? 'true' : undefined}
            aria-haspopup="menu"
          >
            <ArrowDropDown />
          </Button>
        )}
      </ButtonGroup>
      <Popper
        sx={{ zIndex: 1 }}
        open={setDetailsDropdownOpen}
        anchorEl={detailsAnchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener
                onClickAway={() =>
                  dispatch(updateState({ setDetailsDropdownOpen: false }))
                }
              >
                <MenuList id="details-menu" autoFocusItem>
                  <MenuItem
                    selected={podEditTab === 'details'}
                    onClick={() => {
                      invalidate();
                      if (podTab === 'edit') {
                        dispatch(
                          updateState({
                            podDetailTab: 'details',
                            setDetailsDropdownOpen: false,
                          })
                        );
                      } else {
                        dispatch(
                          updateState({
                            podTab: 'details',
                            podDetailTab: 'details',
                            setDetailsDropdownOpen: false,
                          })
                        );
                      }
                    }}
                  >
                    Details
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      invalidateDerived();
                      let template = pod?.template || '';
                      // Split template string like 'postgres:14@2025-07-12-16:41:56'
                      let inp_template_id = '';
                      let template_id_part = '';
                      let input_tag = '';
                      let tag_part = '';
                      if (template) {
                        [template_id_part, tag_part] = template.split('@');
                        if (template_id_part && tag_part) {
                          [inp_template_id, input_tag] =
                            template_id_part.split(':');
                        }
                      }
                      history.push(
                        `/pods/templates/${inp_template_id}/tags/${input_tag}@${tag_part}` // Navigate to template tag
                      );
                      dispatch(
                        updateState({
                          setDetailsDropdownOpen: false,
                          templateNavExpandedItems: [
                            ...(Array.isArray(templateNavExpandedItems)
                              ? templateNavExpandedItems
                              : []),
                            inp_template_id,
                            `${inp_template_id}-${input_tag}`,
                          ],
                          templateNavSelectedItems: `${inp_template_id}-${input_tag}-${tag_part}`,
                          templateTagTab: 'detailsTag',
                          templateTab: 'detailsTag',
                          templateRootTab: 'dashboard',
                        })
                      );
                    }}
                  >
                    Visit Tag
                  </MenuItem>
                  <MenuItem
                    selected={podEditTab === 'derived'}
                    onClick={() => {
                      invalidateDerived();
                      if (podTab === 'edit') {
                        dispatch(
                          updateState({
                            podDetailTab: 'derived',
                            setDetailsDropdownOpen: false,
                          })
                        );
                      } else {
                        dispatch(
                          updateState({
                            podTab: 'details',
                            podDetailTab: 'derived',
                            setDetailsDropdownOpen: false,
                          })
                        );
                      }
                    }}
                  >
                    Derived
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </React.Fragment>,
    // Logs/Actions split button (MUI SplitButton pattern)
    <React.Fragment key="logs-split">
      <ButtonGroup variant="outlined" size="small" ref={logsAnchorRef}>
        <LoadingButton
          sx={{ minWidth: '60px' }}
          variant="outlined"
          color={
            (podTab === 'logs' || podTab === 'actionlogs') &&
            (podLogTab === 'logs' || podLogTab === 'actions')
              ? 'secondary'
              : 'primary'
          }
          onClick={() => {
            invalidateLogs();
            dispatch(updateState({ podTab: 'logs' }));
          }}
        >
          {podLogTab}
        </LoadingButton>
        <Button
          onClick={() =>
            dispatch(updateState({ setLogsDropdownOpen: !setLogsDropdownOpen }))
          }
          color={
            (podTab === 'logs' || podTab === 'actionlogs') &&
            (podLogTab === 'logs' || podLogTab === 'actions')
              ? 'secondary'
              : 'primary'
          }
          sx={{ fontSize: '14px', minWidth: '28px !important', width: '28px' }}
          variant="outlined"
          aria-controls={setLogsDropdownOpen ? 'logs-menu' : undefined}
          aria-expanded={setLogsDropdownOpen ? 'true' : undefined}
          aria-haspopup="menu"
        >
          <ArrowDropDown />
        </Button>
      </ButtonGroup>
      <Popper
        sx={{ zIndex: 1 }}
        open={setLogsDropdownOpen}
        anchorEl={logsAnchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener
                onClickAway={() =>
                  dispatch(updateState({ setLogsDropdownOpen: false }))
                }
              >
                <MenuList id="logs-menu" autoFocusItem>
                  <MenuItem
                    selected={podLogTab === 'logs'}
                    onClick={() => {
                      invalidateLogs();
                      if (podTab === 'edit') {
                        dispatch(
                          updateState({
                            podLogTab: 'logs',
                            setLogsDropdownOpen: false,
                          })
                        );
                      } else {
                        dispatch(
                          updateState({
                            podTab: 'logs',
                            podLogTab: 'logs',
                            setLogsDropdownOpen: false,
                          })
                        );
                      }
                    }}
                  >
                    Logs
                  </MenuItem>
                  <MenuItem
                    selected={podLogTab === 'actionlogs'}
                    onClick={() => {
                      invalidateLogs();
                      if (podTab === 'edit') {
                        dispatch(
                          updateState({
                            podLogTab: 'actions',
                            setLogsDropdownOpen: false,
                          })
                        );
                      } else {
                        dispatch(
                          updateState({
                            podTab: 'logs',
                            podLogTab: 'actions',
                            setLogsDropdownOpen: false,
                          })
                        );
                      }
                    }}
                  >
                    Actions
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </React.Fragment>,
    <Button
      key="secrets"
      variant="outlined"
      size="small"
      color={podTab === 'secrets' ? 'secondary' : 'primary'}
      onClick={() => {
        invalidate();
        dispatch(updateState({ podTab: 'secrets' }));
      }}
    >
      Secrets
    </Button>,
    <React.Fragment key="perms-split">
      <ButtonGroup variant="outlined" size="small">
        <LoadingButton
          sx={{ minWidth: '60px' }}
          variant="outlined"
          color={podTab === 'perms' ? 'secondary' : 'primary'}
          onClick={() => {
            invalidate();
            dispatch(updateState({ podTab: 'perms' }));
          }}
        >
          Perms
        </LoadingButton>
        {podTab === 'perms' && (
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
    </React.Fragment>,
  ];

  const detailsRightButtons = [
    tapisUiUriRedirect &&
    networkingObj?.tapis_ui_uri_description &&
    networkingUrl &&
    networkingObj?.protocol == 'http' &&
    (podStatus === 'AVAILABLE' || podDerivedStatus === 'AVAILABLE') ? (
      <Tooltip
        key="networking-tooltip"
        title={networkingObj?.tapis_ui_uri_description}
      >
        <span>
          <Button
            key="networking"
            variant="outlined"
            size="small"
            color="primary"
            disabled={
              objId === undefined ||
              !networkingUrl ||
              !(podStatus === 'AVAILABLE' || podDerivedStatus === 'AVAILABLE')
            }
            component="a"
            href={networkingUrl ? `https://${networkingUrl}` : undefined}
            target="_blank"
            rel="noopener noreferrer"
          >
            Link
          </Button>
        </span>
      </Tooltip>
    ) : (
      <Button
        key="networking"
        variant="outlined"
        size="small"
        color="primary"
        disabled={
          objId === undefined ||
          !networkingUrl ||
          networkingObj?.protocol !== 'http' ||
          !(podStatus === 'AVAILABLE' || podDerivedStatus === 'AVAILABLE')
        }
        component="a"
        href={networkingUrl ? `https://${networkingUrl}` : undefined}
        target="_blank"
        rel="noopener noreferrer"
      >
        Link
      </Button>
    ),
    <Button
      key="help"
      variant="outlined"
      size="small"
      onClick={() => setModal('tooltip')}
    >
      Help
    </Button>,
    <Button
      key="copy"
      variant="outlined"
      size="small"
      onClick={() => navigator.clipboard.writeText(getCodeMirrorValue() ?? '')}
    >
      Copy
    </Button>,
  ];

  // Refactor renderTabBar to just render the elements
  const renderTabBar = (
    leftButtons: React.ReactNode[],
    rightButtons: React.ReactNode[]
  ) => {
    return (
      <div
        style={{
          paddingBottom: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Stack spacing={2} direction="row">
          {leftButtons.map((btn, idx) => btn)}
        </Stack>
        <Stack spacing={2} direction="row">
          {rightButtons.map((btn, idx) => btn)}
        </Stack>
      </div>
    );
  };

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
        <PodsNavigation from="pods" id={objId} />
        <PodToolbar />
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', overflow: 'auto' }}>
        <div style={{}} className={` ${styles['nav']} `}>
          <NavPods />
        </div>
        <div
          style={{
            margin: '1rem',
            flex: 1,
            overflow: 'hidden',
          }}
        >
          {objId === undefined
            ? renderTabBar(dashboardLeftButtons, dashboardRightButtons)
            : renderTabBar(detailsLeftButtons, detailsRightButtons)}
          <div className={styles['container']}>
            <PodsCodeMirror
              editValue={
                podTab === 'edit' ? JSON.stringify(createPodData, null, 2) : ''
              }
              value={codeMirrorValue?.toString() ?? ''}
              isVisible={true}
              isEditorVisible={
                (podTab === 'edit' && objId !== undefined) ||
                (podRootTab === 'createPod' && objId === undefined)
              }
              editPanel={
                podTab === 'edit' && objId !== undefined ? (
                  <PodWizardEdit pod={pod} />
                ) : (
                  <PodWizard />
                )
              }
              //scrollToBottom should be true if podTab == 'log' or 'actionlogs'
              scrollToBottom={podTab === 'logs' || podTab === 'actionlogs'}
            />
          </div>
          <div>{renderTooltipModal()}</div>
          {/* modals */}
          {modal === 'podPermissions' && <PodPermissionModal toggle={toggle} />}
        </div>
      </div>
    </div>
  );
};
export default PagePods;
