import React, { useState, useEffect } from 'react';
import { decode } from 'base-64';
import { json } from '@codemirror/lang-json';
import { vscodeDark, vscodeDarkInit } from '@uiw/codemirror-theme-vscode';
import { Stack } from '@mui/material';
import { Button, Chip } from '@mui/material';
import CodeMirror from '@uiw/react-codemirror';
import { LoadingButton } from '@mui/lab';
import { RefreshRounded } from '@mui/icons-material';
import { UpdatePodBase } from '../PodToolbar/CreatePodModal';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { updateState } from '../../redux/podsSlice';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import { Pods } from '@tapis/tapis-typescript';
import {
  PageLayout,
  LayoutBody,
  LayoutNavWrapper,
  CopyButton,
  TooltipModal,
  DescriptionList,
  Tabs,
  JSONDisplay,
  QueryWrapper,
  SectionMessage,
} from '@tapis/tapisui-common';
import { PodPermissionModal } from '../Modals';

import { NavPods, PodsCodeMirror, PodsNavigation } from 'app/Pods/_components';
import PodToolbar from 'app/Pods/_components/PodToolbar';
import PodsLoadingText from '../PodsLoadingText';

import styles from '../Pages.module.scss';

const PagePods: React.FC<{ objId: string | undefined }> = ({ objId }) => {
  const dispatch = useDispatch();
  const { data, isLoading, isFetching, error, invalidate } = Hooks.useGetPod({
    podId: objId,
  });
  const {
    data: dataLogs,
    isLoading: isLoadingLogs,
    isFetching: isFetchingLogs,
    error: errorLogs,
    invalidate: invalidateLogs,
  } = Hooks.useGetPodLogs({ podId: objId });
  const {
    data: dataSecrets,
    isLoading: isLoadingSecrets,
    isFetching: isFetchingSecrets,
    error: errorSecrets,
    invalidate: invalidateSecrets,
  } = Hooks.useGetPodSecrets({ podId: objId });
  const {
    data: dataPerms,
    isLoading: isLoadingPerms,
    isFetching: isFetchingPerms,
    error: errorPerms,
    invalidate: invalidatePerms,
  } = Hooks.useGetPodPermissions({ podId: objId });

  const tooltipText =
    'Pods saves pod interactions in an Action Logs ledger. User and system interaction with your pod is logged here.';
  const pod: Pods.PodResponseModel | undefined = data?.result;
  const podLogs: Pods.LogsModel | undefined = dataLogs?.result;
  const podSecrets: Pods.CredentialsModel | undefined = dataSecrets?.result;
  const podPerms: Pods.PodPermissionsResponse | undefined =
    dataPerms?.result as Pods.PodPermissionsResponse | undefined;

  // State to control the visibility of the TooltipModal
  const [modal, setModal] = useState<string | undefined>(undefined);
  const toggle = () => {
    setModal(undefined);
  };

  const { podTab } = useSelector((state: RootState) => state.pods);

  const loadingText = PodsLoadingText();

  const tooltipConfigs: {
    [key: string]: { tooltipTitle: string; tooltipText: string };
  } = {
    details: {
      tooltipTitle: 'Pod Definition',
      tooltipText:
        'This is the JSON definition of this Pod. Visit our live-docs for an exact schema: https://tapis-project.github.io/live-docs/?service=Pods',
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
    const config = tooltipConfigs[podTab];
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

  const [sharedData, setSharedData] = useState();

  const getCodeMirrorValue = () => {
    switch (podTab) {
      case 'details':
        return error
          ? `error: ${error}`
          : isFetching
          ? loadingText
          : JSON.stringify(pod, null, 2);
      case 'logs':
        return error
          ? `error: ${errorLogs}`
          : isFetchingLogs
          ? loadingText
          : podLogs?.logs;
      case 'actionlogs':
        return error
          ? `error: ${errorLogs}`
          : isFetchingLogs
          ? loadingText
          : podLogs?.action_logs?.join('\n');
      case 'secrets':
        return error
          ? `error: ${errorSecrets}`
          : isFetchingSecrets
          ? loadingText
          : JSON.stringify(podSecrets, null, 2);
      case 'edit':
        return error
          ? `error: ${error}`
          : isFetching
          ? loadingText
          : JSON.stringify(sharedData, null, 2);
      case 'perms':
        return error
          ? `error: ${error}`
          : isFetching
          ? loadingText
          : JSON.stringify(podPerms, null, 2);
      default:
        return ''; // Default or placeholder value
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
        switch (podTab) {
          case 'details':
            invalidate();
            break;
          case 'logs':
          case 'actionlogs':
            invalidateLogs();
            break;
          case 'secrets':
            invalidateSecrets();
            break;
          default:
            // Optionally handle any other cases or do nothing
            break;
        }
      },
    },
    { id: 'edit', label: 'Edit', tabValue: 'edit' },
    { id: 'details', label: 'Details', tabValue: 'details' },
    { id: 'logs', label: 'Logs', tabValue: 'logs' },
    { id: 'actionlogs', label: 'Action Logs', tabValue: 'actionlogs' },
    { id: 'secrets', label: 'Secrets', tabValue: 'secrets' },
    { id: 'perms', label: 'Perms', tabValue: 'perms' },
  ];

  const networkingUrl = Object.values(data?.result?.networking ?? {})[0]?.url;

  const podStatus = data?.result?.status;

  const rightButtons: ButtonConfig[] = [
    {
      id: 'networking',
      label: 'Link',
      disabled: !networkingUrl || podStatus != 'AVAILABLE',
      customOnClick: () => {
        if (networkingUrl) {
          window.open('https://' + networkingUrl);
        }
      },
    },
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

  return (
    <div>
      <div className={styles['tabs']}>
        <div>
          <PodsNavigation from="pods" id={objId} />
        </div>
        <PodToolbar />
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', overflow: 'auto' }}>
        <div style={{}} className={` ${styles['nav']} `}>
          <NavPods />
        </div>
        {objId === undefined ? (
          <div style={{ margin: '1rem', flex: 1, overflow: 'auto' }}>
            <SectionMessage type="info">
              Select a pod from the list.
            </SectionMessage>
          </div>
        ) : (
          <div
            style={{
              margin: '1rem',
              minWidth: '200px',
              flex: 1,
              overflow: 'auto',
            }}
          >
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
                      loading={
                        id === 'refresh' &&
                        (isFetching || isFetchingLogs || isFetchingSecrets)
                      }
                      key={id}
                      variant="outlined"
                      disabled={disabled}
                      color={podTab === tabValue ? 'secondary' : 'primary'}
                      size="small"
                      onClick={() => {
                        if (customOnClick) {
                          customOnClick();
                        } else if (tabValue) {
                          dispatch(updateState({ podTab: tabValue }));
                        }
                      }}
                    >
                      {icon || label}
                    </LoadingButton>
                  )
                )}
              </Stack>
              <Stack spacing={2} direction="row">
                {podTab === 'perms' && (
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
                {rightButtons.map(
                  ({ id, label, tabValue, customOnClick, icon, disabled }) => (
                    <Button
                      key={id}
                      sx={{ minWidth: '10px' }}
                      variant="outlined"
                      disabled={disabled}
                      color={podTab === tabValue ? 'secondary' : 'primary'}
                      size="small"
                      onClick={() => {
                        if (customOnClick) {
                          customOnClick();
                        } else if (tabValue) {
                          dispatch(updateState({ podTab: tabValue }));
                        }
                      }}
                    >
                      {label}
                    </Button>
                  )
                )}
              </Stack>
            </div>
            <div className={styles['container']}>
              <PodsCodeMirror
                value={codeMirrorValue?.toString() ?? ''}
                isVisible={true}
                isEditorVisible={podTab === 'edit'}
                editPanel={
                  <UpdatePodBase
                    sharedData={sharedData}
                    setSharedData={setSharedData}
                  />
                }
              />
            </div>
          </div>
        )}

        <div>{renderTooltipModal()}</div>
        {modal === 'podPermissions' && <PodPermissionModal toggle={toggle} />}
      </div>
    </div>
  );
};

export default PagePods;
