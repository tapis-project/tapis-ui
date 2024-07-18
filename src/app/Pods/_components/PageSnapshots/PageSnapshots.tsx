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
import styles from '../Pages.module.scss';
import { Button } from '@mui/material';
import { SectionMessage } from '@tapis/tapisui-common';

import PodToolbar from 'app/Pods/_components/PodToolbar';
// import { Menu } from '../_components';

import { useHistory } from 'react-router-dom';
import { PodsNavigation } from 'app/Pods/_components';
import NavSnapshots from '../NavSnapshots/NavSnapshots';

const PageSnapshots: React.FC<{ objId: string | undefined }> = ({ objId }) => {
  const navigate = useHistory();
  if (objId === '') {
    objId = '';
  }
  const { data, isLoading, error } = Hooks.useDetailsSnapshots({
    snapshotId: objId,
  });

  const tooltipText =
    'Pods saves pod interactions in an Action Logs ledger. User and system interaction with your pod is logged here.';
  const pod: any | undefined = data?.result;

  // State to control the visibility of the TooltipModal
  const [modal, setModal] = useState<string | undefined>(undefined);
  // Function to toggle the modal visibility
  const toggle = () => {
    setModal(undefined);
  };

  const [snapshotBarTab, setSnapshotBarTab] = useState<string>('details');

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
        <PodsNavigation from="images" id="" podTab="details" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', overflow: 'auto' }}>
        <div style={{}} className={` ${styles['nav']} `}>
          <NavSnapshots />
        </div>
        {objId === undefined ? (
          <div style={{ margin: '1rem', flex: 1, overflow: 'auto' }}>
            <SectionMessage type="info">
              Select an snapshot from the list.
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
            <QueryWrapper isLoading={isLoading} error={error}>
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
                    color={
                      snapshotBarTab === 'details' ? 'secondary' : 'primary'
                    }
                    size="small"
                    onClick={() => {
                      setSnapshotBarTab('details');
                    }}
                  >
                    Details
                  </Button>
                </Stack>
                <Stack spacing={2} direction="row" className={styles['stack']}>
                  <Button
                    //startIcon={<Info />}
                    variant="outlined"
                    color={snapshotBarTab === 'help' ? 'secondary' : 'primary'}
                    size="small"
                    onClick={() => {
                      setSnapshotBarTab('tooltip');
                    }}
                  >
                    Help
                  </Button>
                  <Button
                    //startIcon={<Info />}
                    variant="outlined"
                    color={snapshotBarTab === 'help' ? 'secondary' : 'primary'}
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        JSON.stringify(pod, null, 2)
                      );
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
                  display: snapshotBarTab === 'details' ? 'block' : 'none',
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

export default PageSnapshots;
