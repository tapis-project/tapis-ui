import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { decode } from 'base-64';
import { json } from '@codemirror/lang-json';
import { vscodeDark, vscodeDarkInit } from '@uiw/codemirror-theme-vscode';
import Stack from '@mui/material/Stack';
import { Button } from '@mui/material';
import CodeMirror from '@uiw/react-codemirror';

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

import { NavPods, PodsCodeMirror, PodsNavigation } from 'app/Pods/_components';
import PodToolbar from 'app/Pods/_components/PodToolbar';
// import { Menu } from '../_components';

import { usePodsContext } from '../PodsContext';

import PodsLoadingText from '../PodsLoadingText';

import styles from '../Pages.module.scss';
const PagePods: React.FC<{ objId: string | undefined }> = ({ objId }) => {
  const navigate = useHistory();
  const { data, isLoading, isFetching, error, invalidate } = Hooks.useDetails({ podId: objId });
  const {
    data: dataLogs,
    isLoading: isLoadingLogs,
    isFetching: isFetchingLogs,
    error: errorLogs,
    invalidate: invalidateLogs,
  } = Hooks.useLogs({ podId: objId });
  const {
    data: dataSecrets,
    isLoading: isLoadingSecrets,
    isFetching: isFetchingSecrets,
    error: errorSecrets,
    invalidate: invalidateSecrets,
  } = Hooks.useGetPodSecrets({ podId: objId });

  const tooltipText =
    'Pods saves pod interactions in an Action Logs ledger. User and system interaction with your pod is logged here.';
  const pod: Pods.PodResponseModel | undefined = data?.result;
  const podLogs: Pods.LogsModel | undefined = dataLogs?.result;
  const podSecrets: Pods.CredentialsModel | undefined = dataSecrets?.result;

  // State to control the visibility of the TooltipModal
  const [modal, setModal] = useState<string | undefined>(undefined);
  const toggle = () => {
    setModal(undefined);
  };
  const [podBarTab, setPodBarTab] = useState<string>('details');

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
  };

  const renderTooltipModal = () => {
    const config = tooltipConfigs[podBarTab];
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
    switch (podBarTab) {
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
      default:
        return ''; // Default or placeholder value
    }
  };

  const codeMirrorValue = getCodeMirrorValue();

  type ButtonConfig = {
    id: string;
    label: string;
    tabValue?: string; // Made optional to accommodate both uses
    customOnClick?: () => void;
  };

  const leftButtons: ButtonConfig[] = [
    {
      id: 'refresh',
      label: 'Refresh',
      customOnClick: () => {
        switch (podBarTab) {
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
    { id: 'details', label: 'Details', tabValue: 'details' },
    { id: 'logs', label: 'Logs', tabValue: 'logs' },
    { id: 'actionlogs', label: 'Action Logs', tabValue: 'actionlogs' },
    { id: 'secrets', label: 'Secrets', tabValue: 'secrets' },
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

  return (
    <div>
      <div className={styles['tabs']}>
        <div>
          <PodsNavigation from="pods" id={objId} podTab={podBarTab} />
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
                {leftButtons.map(({ id, label, tabValue, customOnClick }) => (
                  <Button
                    key={id}
                    variant="outlined"
                    color={podBarTab === tabValue ? 'secondary' : 'primary'}
                    size="small"
                    onClick={() => {
                      if (customOnClick) {
                        customOnClick();
                      } else if (tabValue && podBarTab !== undefined) {
                        setPodBarTab(tabValue);
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
                    color={podBarTab === tabValue ? 'secondary' : 'primary'}
                    size="small"
                    onClick={() => {
                      if (customOnClick) {
                        customOnClick();
                      } else if (tabValue && podBarTab !== undefined) {
                        setPodBarTab(tabValue);
                      }
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </Stack>
            </div>
            <div className={styles['container']}>
              <PodsCodeMirror
                value={codeMirrorValue?.toString() ?? ''}
                isVisible={true}
              />
            </div>
          </div>
        )}

        <div>{renderTooltipModal()}</div>
      </div>
    </div>
  );
};

export default PagePods;
