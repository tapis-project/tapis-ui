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

import PodToolbar from 'app/Pods/_components/PodToolbar';
// import { SnapshotWizard, SnapshotWizardEdit } from '../';
import { UpdatePodBase } from '../PodToolbar/CreatePodModal';
import { PodWizard, PodWizardEdit } from '../';
import { PodPermissionModal } from '../Modals';
import { useHistory } from 'react-router-dom';
import { NavPods, PodsCodeMirror, PodsNavigation } from 'app/Pods/_components';
import PodsLoadingText from '../PodsLoadingText';
import { useAppSelector, updateState, useAppDispatch } from '@redux';

const PagePods: React.FC<{ objId: string | undefined }> = ({ objId }) => {
  const dispatch = useAppDispatch();
  const { podTab, podRootTab } = useAppSelector((state) => state.pods);

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
  const {
    data: dataDerived,
    isLoading: isLoadingDerived,
    isFetching: isFetchingDerived,
    error: errorDerived,
    invalidate: invalidateDerived,
  } = Hooks.useGetPodDerived({ podId: objId });

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
    const config =
      tooltipConfigs[(objId === undefined ? podRootTab : podTab) ?? ''];
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
      switch (podRootTab) {
        case 'dashboard':
          return `Pods:
You can manage and create pods here.
The Pods Service provides an API to manage Kubernetes pods.
The service manages pods, certificates, proxying, and more.
The output of the service is a encrypted, networked, Kubernetes pod.

Select or create a pod to get started.`;
        case 'createPod':
          return JSON.stringify(sharedData, null, 2);
        default:
          return ''; // Default or placeholder value
      }
    } else {
      switch (podTab) {
        case 'details':
          return error
            ? `error: ${error}`
            : isFetching
            ? loadingText
            : JSON.stringify(pod, null, 2);
        case 'derived':
          return error
            ? `error: ${error}`
            : isFetching
            ? loadingText
            : JSON.stringify(dataDerived, null, 2);
        case 'logs':
          return error
            ? `error: ${errorLogs}`
            : isFetchingLogs
            ? loadingText
            : podLogs?.logs
            ? podLogs.logs
            : 'No logs available from this pod yet.';
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
            : JSON.stringify(pod, null, 2);
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
    { id: 'derived', label: 'Derived', tabValue: 'derived' },
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
      disabled:
        objId === undefined || !networkingUrl || podStatus != 'AVAILABLE',
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

  const getTabBarButtons = () => {
    if (objId === undefined) {
      return [
        { id: 'dashboard', label: 'Dashboard', tabValue: 'dashboard' },
        {
          id: 'createPod',
          label: 'Create Pod',
          tabValue: 'createPod',
          disabled: true,
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
              loading={
                id === 'refresh' &&
                (isFetching || isFetchingLogs || isFetchingSecrets)
              }
              key={id}
              variant="outlined"
              disabled={disabled}
              color={
                podTab === tabValue || podRootTab === tabValue
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
                    dispatch(updateState({ podRootTab: tabValue }));
                  } else {
                    dispatch(updateState({ podTab: tabValue }));
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

        {rightButtons.map(({ id, label, tabValue, customOnClick }) => (
          <Button
            key={id}
            variant="outlined"
            color={
              podTab === tabValue || podRootTab === tabValue
                ? 'secondary'
                : 'primary'
            }
            size="small"
            onClick={() => {
              if (customOnClick) {
                customOnClick();
              } else if (tabValue) {
                if (objId === undefined) {
                  dispatch(updateState({ podRootTab: tabValue }));
                } else {
                  dispatch(updateState({ podTab: tabValue }));
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
            overflow: 'auto',
          }}
        >
          {renderTabBar(getTabBarButtons(), rightButtons)}
          <div className={styles['container']}>
            <PodsCodeMirror
              editValue={
                podTab === 'edit' ? JSON.stringify(sharedData, null, 2) : ''
              }
              value={codeMirrorValue?.toString() ?? ''}
              isVisible={true}
              isEditorVisible={
                (podTab === 'edit' && objId !== undefined) ||
                (podRootTab === 'createPod' && objId === undefined)
              }
              editPanel={
                podTab === 'edit' && objId !== undefined ? (
                  <PodWizardEdit
                    sharedData={sharedData}
                    setSharedData={setSharedData}
                  />
                ) : (
                  <PodWizard
                    sharedData={sharedData}
                    setSharedData={setSharedData}
                  />
                )
              }
              //scrollToBottom should be true if podTab == 'log' or 'actionlogs'
              scrollToBottom={podTab === 'logs' || podTab === 'actionlogs'}
            />
          </div>
          <div>{renderTooltipModal()}</div>
          {modal === 'podPermissions' && <PodPermissionModal toggle={toggle} />}
        </div>
      </div>
    </div>
  );
};
export default PagePods;
