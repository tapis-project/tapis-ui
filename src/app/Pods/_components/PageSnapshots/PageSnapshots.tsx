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
import { SectionMessage } from '@tapis/tapisui-common';

import PodToolbar from 'app/Pods/_components/PodToolbar';

import { useHistory } from 'react-router-dom';
import NavSnapshots from '../NavSnapshots/NavSnapshots';
import { NavPods, PodsCodeMirror, PodsNavigation } from 'app/Pods/_components';
import PodsLoadingText from '../PodsLoadingText';

const PageSnapshots: React.FC<{ objId: string | undefined }> = ({ objId }) => {
  const navigate = useHistory();
  if (objId === '') {
    objId = '';
  }
  const { data, isLoading, error } = Hooks.useGetSnapshot({
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

  const loadingText = PodsLoadingText();

  const tooltipConfigs: {
    [key: string]: { tooltipTitle: string; tooltipText: string };
  } = {
    details: {
      tooltipTitle: 'Pod Definition',
      tooltipText:
        'This is the JSON definition of this Pod. Visit our live-docs for an exact schema: https://tapis-project.github.io/live-docs/?service=Pods',
    },
  };

  const renderTooltipModal = () => {
    const config = tooltipConfigs[snapshotBarTab];
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
    switch (snapshotBarTab) {
      case 'details':
        return error
          ? `error: ${error}`
          : loadingText
          ? 'loading...'
          : JSON.stringify(pod, null, 2);
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
    { id: 'details', label: 'Details', tabValue: 'details' },
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
        <PodsNavigation from="images" id="" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', overflow: 'auto' }}>
        <div style={{}} className={` ${styles['nav']} `}>
          <NavSnapshots />
        </div>
        {objId === undefined ? (
          <div style={{ margin: '1rem', flex: 1, overflow: 'auto' }}>
            <SectionMessage type="info">
              Select a snapshot from the list.
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
                    color={
                      snapshotBarTab === tabValue ? 'secondary' : 'primary'
                    }
                    size="small"
                    onClick={() => {
                      if (customOnClick) {
                        customOnClick();
                      } else if (tabValue && snapshotBarTab !== undefined) {
                        setSnapshotBarTab(tabValue);
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
                    color={
                      snapshotBarTab === tabValue ? 'secondary' : 'primary'
                    }
                    size="small"
                    onClick={() => {
                      if (customOnClick) {
                        customOnClick();
                      } else if (tabValue && snapshotBarTab !== undefined) {
                        setSnapshotBarTab(tabValue);
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

export default PageSnapshots;
