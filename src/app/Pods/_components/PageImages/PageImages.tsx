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
import styles from './PageImages.module.scss';
import { Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { RefreshRounded } from '@mui/icons-material';
import { SectionMessage } from '@tapis/tapisui-common';

import { NavImages } from 'app/Pods/_components';
import PodToolbar from 'app/Pods/_components/PodToolbar';

import { useHistory } from 'react-router-dom';
import { NavPods, PodsCodeMirror, PodsNavigation } from 'app/Pods/_components';
import PodsLoadingText from '../PodsLoadingText';

const PageImages: React.FC<{ objId: string | undefined }> = ({ objId }) => {
  const navigate = useHistory();
  if (objId === '') {
    objId = '';
  }

  const { data, isFetching, error, invalidate } = Hooks.useGetImage({
    imageId: objId,
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

  const [imageBarTab, setImageBarTab] = useState<string>('details');

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
    const config = tooltipConfigs[imageBarTab];
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
    switch (imageBarTab) {
      case 'details':
        return error
          ? `error: ${error}`
          : isFetching
          ? loadingText
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
    icon?: JSX.Element;
    customOnClick?: () => void;
  };

  const leftButtons: ButtonConfig[] = [
    {
      id: 'refresh',
      label: 'Refresh',
      icon: <RefreshRounded sx={{ height: '20px', maxWidth: '20px' }} />,
      customOnClick: () => {
        invalidate();
      },
    },
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
          <NavImages />
        </div>
        {objId === undefined ? (
          <div style={{ margin: '1rem', flex: 1, overflow: 'auto' }}>
            <SectionMessage type="info">
              Select an image from the list.
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
                  ({ id, label, tabValue, customOnClick, icon }) => (
                    <LoadingButton
                      sx={{ minWidth: '10px' }}
                      loading={id === 'refresh' && isFetching}
                      key={id}
                      variant="outlined"
                      color={imageBarTab === tabValue ? 'secondary' : 'primary'}
                      size="small"
                      onClick={() => {
                        if (customOnClick) {
                          customOnClick();
                        } else if (tabValue && imageBarTab !== undefined) {
                          setImageBarTab(tabValue);
                        }
                      }}
                    >
                      {icon || label}
                    </LoadingButton>
                  )
                )}
              </Stack>
              <Stack spacing={2} direction="row">
                {rightButtons.map(({ id, label, tabValue, customOnClick }) => (
                  <Button
                    key={id}
                    sx={{ minWidth: '10px' }}
                    variant="outlined"
                    color={imageBarTab === tabValue ? 'secondary' : 'primary'}
                    size="small"
                    onClick={() => {
                      if (customOnClick) {
                        customOnClick();
                      } else if (tabValue && imageBarTab !== undefined) {
                        setImageBarTab(tabValue);
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

export default PageImages;

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
