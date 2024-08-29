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

import { NavTemplates } from 'app/Pods/_components';
import PodToolbar from 'app/Pods/_components/PodToolbar';

import { useHistory } from 'react-router-dom';
import { NavPods, PodsCodeMirror, PodsNavigation } from 'app/Pods/_components';
import PodsLoadingText from '../PodsLoadingText';

const PageTemplates: React.FC<{ objId: string | undefined }> = ({ objId }) => {
  const navigate = useHistory();
  const { data, isLoading, error } = Hooks.useGetTemplate({
    templateId: objId,
  });
  const {
    data: dataTags,
    isLoading: isLoadingTags,
    error: errorTags,
  } = Hooks.useListTemplateTags({
    templateId: objId,
  });

  const tooltipText =
    'Pods saves pod interactions in an Action Logs ledger. User and system interaction with your pod is logged here.';
  const pod: any | undefined = data?.result;
  const templateTags: any | undefined = dataTags?.result;

  // State to control the visibility of the TooltipModal
  const [modal, setModal] = useState<string | undefined>(undefined);
  // Function to toggle the modal visibility
  const toggle = () => {
    setModal(undefined);
  };

  const [templateBarTab, setTemplateBarTab] = useState<string>('details');

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
    const config = tooltipConfigs[templateBarTab];
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
    switch (templateBarTab) {
      case 'details':
        return error
          ? `error: ${error}`
          : isLoading
          ? loadingText
          : JSON.stringify(pod, null, 2);
      case 'tags':
        return error
          ? `error: ${errorTags}`
          : isLoadingTags
          ? loadingText
          : JSON.stringify(templateTags, null, 2);
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
    { id: 'tags', label: 'Tags', tabValue: 'tags' },
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
        <PodsNavigation from="templates" id="" podTab="details" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', overflow: 'auto' }}>
        <div style={{}} className={` ${styles['nav']} `}>
          <NavTemplates />
        </div>
        {objId === undefined ? (
          <div style={{ margin: '1rem', flex: 1, overflow: 'auto' }}>
            <SectionMessage type="info">
              Select a template from the list.
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
                      templateBarTab === tabValue ? 'secondary' : 'primary'
                    }
                    size="small"
                    onClick={() => {
                      if (customOnClick) {
                        customOnClick();
                      } else if (tabValue && templateBarTab !== undefined) {
                        setTemplateBarTab(tabValue);
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
                      templateBarTab === tabValue ? 'secondary' : 'primary'
                    }
                    size="small"
                    onClick={() => {
                      if (customOnClick) {
                        customOnClick();
                      } else if (tabValue && templateBarTab !== undefined) {
                        setTemplateBarTab(tabValue);
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

export default PageTemplates;
