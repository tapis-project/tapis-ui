import React from 'react';
import { useState } from 'react';

import { Pods as Hooks } from '@tapis/tapisui-hooks';
import { Pods } from '@tapis/tapis-typescript';
import { CopyButton, TooltipModal } from '../../../ui';
import { DescriptionList, Tabs, JSONDisplay } from '../../../ui';
import { QueryWrapper } from '../../../wrappers';

import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { vscodeDark, vscodeDarkInit } from '@uiw/codemirror-theme-vscode';
import { decode } from 'base-64';
import Stack from '@mui/material/Stack';
//import { ToolbarButton } from '@tapis/tapisui-common';
import { ToolbarButton } from '../../../ui/JSONDisplay/JSONDisplay';
import styles from './PodDetail.module.scss';
import {
  ArrowBack,
  Info,
  Hub,
  CompareArrows,
  GitHub,
  Tune,
  Memory,
} from '@mui/icons-material';
import {
  Button,
  Box,
  TextField,
  Checkbox,
  FormGroup,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
const PodDetail: React.FC<{ podId: string }> = ({ podId }) => {
  const { data, isLoading, error } = Hooks.useDetails({
    podId,
  });
  const {
    data: data2,
    isLoading: isLoading2,
    error: error2,
  } = Hooks.useLogs({
    podId,
  });
  const tooltipText =
    'Pods saves pod interactions in an Action Logs ledger. User and system interaction with your pod is logged here.';
  const pod: Pods.PodResponseModel | undefined = data?.result;
  const podLogs: Pods.LogsModel | undefined = data2?.result;

  // State to control the visibility of the TooltipModal
  const [modal, setModal] = useState<string | undefined>(undefined);
  // Function to toggle the modal visibility
  const toggle = () => {
    setModal(undefined);
  };
  const [activeTab, setActiveTab] = useState<string | undefined>('details');

  const setTab = (tab: string | undefined) => {
    let tabToSet = tab;
    // if (activeTab == tab) {
    //   tabToSet = undefined;
    // }
    setActiveTab(tabToSet);
  };

  const [value, setValue] = React.useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  return (
    <QueryWrapper isLoading={isLoading || isLoading2} error={error || error2}>
      <div style={{ paddingLeft: '16px', paddingRight: '16px' }}>
        <div
          style={{
            paddingBottom: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Stack spacing={2} direction="row" className={styles['stack']}>
            <Button
              //startIcon={<Info />}
              variant="outlined"
              color={activeTab === 'details' ? 'secondary' : 'primary'}
              size="small"
              onClick={() => {
                setTab('details');
              }}
            >
              Details
            </Button>
            <Button
              //startIcon={<CompareArrows />}
              variant="outlined"
              size="small"
              color={activeTab === 'logs' ? 'secondary' : 'primary'}
              onClick={() => {
                setTab('logs');
              }}
            >
              Logs
            </Button>
            <Button
              //startIcon={<Tune />}
              variant="outlined"
              size="small"
              color={activeTab === 'actionlogs' ? 'secondary' : 'primary'}
              onClick={() => {
                setTab('actionlogs');
              }}
            >
              Action Logs
            </Button>
          </Stack>
          <Stack spacing={2} direction="row" className={styles['stack']}>
            <Button
              //startIcon={<Info />}
              variant="outlined"
              color={activeTab === 'help' ? 'secondary' : 'primary'}
              size="small"
              onClick={() => {
                setModal('tooltip');
              }}
            >
              Help
            </Button>
            <Button
              //startIcon={<Info />}
              variant="outlined"
              color={activeTab === 'help' ? 'secondary' : 'primary'}
              size="small"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(pod, null, 2));
              }}
            >
              Copy2
            </Button>
            <CopyButton
              value={JSON.stringify(pod, null, 2)}
              className={styles.copyButtonRight}
            />
          </Stack>
        </div>
        <div
          style={{
            display: activeTab === 'details' ? 'block' : 'none',
          }}
          className={styles['container']}
        >
          <CodeMirror
            width="100%"
            value={JSON.stringify(pod, null, 2)}
            editable={false}
            readOnly={true}
            extensions={[json()]}
            height="800px" // Use 100vh to fill 100% of viewable height
            minHeight="200px"
            theme={vscodeDarkInit({
              settings: {
                caret: '#c6c6c6',
                fontFamily: 'monospace',
              },
            })}
            //className={` ${styles['cm-editor']} ${styles['cm-scroller']}  ${styles['code']} `}
            style={{
              fontSize: 12,
              backgroundColor: '#f5f5f5',
              fontFamily:
                'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
            }}
          />
        </div>
        <div
          style={{
            display: activeTab === 'logs' ? 'block' : 'none',
          }}
          className={styles['container']}
        >
          <CodeMirror
            value={podLogs?.logs}
            editable={false}
            readOnly={true}
            extensions={[json()]}
            height="800px" // Use 100vh to fill 100% of viewable height
            minHeight="200px"
            theme={vscodeDarkInit({
              settings: {
                caret: '#c6c6c6',
                fontFamily: 'monospace',
              },
            })}
            //className={` ${styles['cm-editor']} ${styles['cm-scroller']}  ${styles['code']} `}
            style={{
              fontSize: 12,
              backgroundColor: '#f5f5f5',
              fontFamily:
                'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
            }}
          />
        </div>
        <div
          style={{
            display: activeTab === 'actionlogs' ? 'block' : 'none',
          }}
          className={styles['container']}
        >
          <CodeMirror
            value={podLogs?.action_logs?.join('\n')}
            editable={false}
            readOnly={true}
            extensions={[json()]}
            height="800px" // Use 100vh to fill 100% of viewable height
            minHeight="200px"
            theme={vscodeDarkInit({
              settings: {
                caret: '#c6c6c6',
                fontFamily: 'monospace',
              },
            })}
            //className={` ${styles['cm-editor']} ${styles['cm-scroller']}  ${styles['code']} `}
            style={{
              fontSize: 12,
              backgroundColor: '#f5f5f5',
              fontFamily:
                'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
            }}
          />
        </div>
      </div>

      {/* tooltipTitle={'Pod Definition'}
tooltipText={
'This is the JSON definition of this Pod. Visit our live-docs for an exact schema: https://tapis-project.github.io/live-docs/?service=Pods'


podLogs?.action_logs
tooltipTitle="Action Logs"
tooltipText="Pods saves pod interactions in an Action Logs ledger. User and system interaction with your pod is logged here."

podLogs?.logs
tooltipTitle="Logs"
tooltipText="Logs contain the stdout/stderr of the most recent Pod run. Use it to debug ywour pod during startup, to grab metrics, inspect logs, and output data from your Pod."
 */}

      {/* {modal === 'startpod' && <StartPodModal toggle={toggle} />}
    {modal === 'restartpod' && <RestartPodModal toggle={toggle} />}
    {modal === 'stoppod' && <StopPodModal toggle={toggle} />} */}
      {modal === 'tooltip' && (
        <TooltipModal
          toggle={toggle}
          tooltipTitle={'Pod Definition'}
          tooltipText={
            'This is the JSON definition of this Pod. Visit our live-docs for an exact schema: https://tapis-project.github.io/live-docs/?service=Pods'
          }
        />
      )}
    </QueryWrapper>
  );
};

export default PodDetail;
