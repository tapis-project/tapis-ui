import React from 'react';
import { useState } from 'react';

import { Pods as Hooks } from '@tapis/tapisui-hooks';
import { Pods } from '@tapis/tapis-typescript';
// import { CopyButton, TooltipModal } from '../../../ui';
// import { DescriptionList, Tabs, JSONDisplay } from '../../../ui';
//import { QueryWrapper } from '../../../wrappers';
import {
  PageLayout,
  LayoutBody,
  LayoutNavWrapper,
} from '@tapis/tapisui-common';

import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { vscodeDark, vscodeDarkInit } from '@uiw/codemirror-theme-vscode';
import { decode } from 'base-64';
import Stack from '@mui/material/Stack';
import {
  CopyButton,
  TooltipModal,
  DescriptionList,
  Tabs,
  JSONDisplay,
  QueryWrapper,
} from '@tapis/tapisui-common';
import { Button } from '@mui/material';
import { SectionMessage } from '@tapis/tapisui-common';

import { NavPods } from 'app/Pods/_components';
import PodToolbar from 'app/Pods/_components/PodToolbar';
// import { Menu } from '../_components';
import { useHistory } from 'react-router-dom';

import { PodsNavigation } from 'app/Pods/_components';

import { usePodsContext } from '../PodsContext';

import styles from '../Pages.module.scss';

const PagePods: React.FC<{ objId: string | undefined }> = ({ objId }) => {
  const navigate = useHistory();
  const { data, isLoading, error } = Hooks.useDetails({ podId: objId });
  const {
    data: dataLogs,
    isLoading: isLoadingLogs,
    error: errorLogs,
  } = Hooks.useLogs({ podId: objId });
  const {
    data: dataSecrets,
    isLoading: isLoadingSecrets,
    error: errorSecrets,
  } = Hooks.useLogs({ podId: objId });

  const tooltipText =
    'Pods saves pod interactions in an Action Logs ledger. User and system interaction with your pod is logged here.';
  const pod: Pods.PodResponseModel | undefined = data?.result;
  const podLogs: Pods.LogsModel | undefined = dataLogs?.result;
  const podSecrets: Pods.LogsModel | undefined = dataSecrets?.result;
  console.log('secrets', dataSecrets);
  // State to control the visibility of the TooltipModal
  const [modal, setModal] = useState<string | undefined>(undefined);
  const toggle = () => {
    setModal(undefined);
  };

  const [podBarTab, setPodBarTab] = useState<string>('details');

  const { lastPodTab } = usePodsContext();

  // if (lastPodTab !== undefined) {
  //   setPodBarTab(lastPodTab);
  // }

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
            <QueryWrapper
              isLoading={isLoading || isLoadingLogs}
              error={error || errorLogs}
            >
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
                    color={podBarTab === 'details' ? 'secondary' : 'primary'}
                    size="small"
                    onClick={() => {
                      setPodBarTab('details');
                    }}
                  >
                    Details
                  </Button>
                  <Button
                    //startIcon={<CompareArrows />}
                    variant="outlined"
                    size="small"
                    color={podBarTab === 'logs' ? 'secondary' : 'primary'}
                    onClick={() => {
                      setPodBarTab('logs');
                    }}
                  >
                    Logs
                  </Button>
                  <Button
                    //startIcon={<Tune />}
                    variant="outlined"
                    size="small"
                    color={podBarTab === 'actionlogs' ? 'secondary' : 'primary'}
                    onClick={() => {
                      setPodBarTab('actionlogs');
                    }}
                  >
                    Action Logs
                  </Button>
                  <Button
                    //startIcon={<Tune />}
                    variant="outlined"
                    size="small"
                    color={podBarTab === 'secrets' ? 'secondary' : 'primary'}
                    onClick={() => {
                      setPodBarTab('secrets');
                    }}
                  >
                    Secrets
                  </Button>
                </Stack>
                <Stack spacing={2} direction="row" className={styles['stack']}>
                  <Button
                    //startIcon={<Info />}
                    variant="outlined"
                    color={podBarTab === 'help' ? 'secondary' : 'primary'}
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
                    color={podBarTab === 'help' ? 'secondary' : 'primary'}
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        JSON.stringify(pod, null, 2)
                      );
                    }}
                  >
                    Copy
                  </Button>
                  <CopyButton
                    value={JSON.stringify(pod, null, 2)}
                    className={styles.copyButtonRight}
                  />
                </Stack>
              </div>
              <div
                style={{
                  display: podBarTab === 'details' ? 'block' : 'none',
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
                  display: podBarTab === 'logs' ? 'block' : 'none',
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
                  display: podBarTab === 'actionlogs' ? 'block' : 'none',
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
              <div
                style={{
                  display: podBarTab === 'secrets' ? 'block' : 'none',
                }}
                className={styles['container']}
              >
                <CodeMirror
                  value={JSON.stringify(podSecrets, null, 2)}
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
            </QueryWrapper>
          </div>
        )}

        {modal === 'tooltip' && (
          <TooltipModal
            toggle={toggle}
            tooltipTitle={'Pod Definition'}
            tooltipText={
              'This is the JSON definition of this Pod. Visit our live-docs for an exact schema: https://tapis-project.github.io/live-docs/?service=Pods'
            }
          />
        )}
      </div>
    </div>
  );
};

export default PagePods;

//       {/* tooltipTitle={'Pod Definition'}
// tooltipText={
// 'This is the JSON definition of this Pod. Visit our live-docs for an exact schema: https://tapis-project.github.io/live-docs/?service=Pods'

// podLogs?.action_logs
// tooltipTitle="Action Logs"
// tooltipText="Pods saves pod interactions in an Action Logs ledger. User and system interaction with your pod is logged here."

// podLogs?.logs
// tooltipTitle="Logs"
// tooltipText="Logs contain the stdout/stderr of the most recent Pod run. Use it to debug ywour pod during startup, to grab metrics, inspect logs, and output data from your Pod."
//  */}
