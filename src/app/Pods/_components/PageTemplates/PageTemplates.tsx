import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
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
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { vscodeDark, vscodeDarkInit } from '@uiw/codemirror-theme-vscode';
import { decode } from 'base-64';
import {
  Stack,
  Button,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AccordionActions,
} from '@mui/material';
import { ExpandMoreRounded } from '@mui/icons-material';
import styles from '../Pages.module.scss';
import {
  NavTemplates,
  PodsNavigation,
  PodsCodeMirror,
} from 'app/Pods/_components';
import PodsLoadingText from '../PodsLoadingText';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { updateState } from '../../redux/podsSlice';

const PageTemplates: React.FC<{
  objId: string | undefined;
  tagId: string | undefined;
}> = ({ objId, tagId }) => {
  const dispatch = useDispatch();
  const navigate = useHistory();
  const { data, isLoading, error } = Hooks.useGetTemplate({
    templateId: objId,
  });
  const {
    data: dataTags,
    isLoading: isLoadingTags,
    error: errorTags,
  } = Hooks.useListTemplateTags({
    templateId: objId as string,
    full: true,
  });
  const {
    data: dataTemplatesAndTags,
    isLoading: isLoadingTemplatesAndTags,
    error: errorTemplatesAndTags,
  } = Hooks.useListTemplatesAndTags({
    full: true,
  });

  const tooltipText =
    'Pods saves pod interactions in an Action Logs ledger. User and system interaction with your pod is logged here.';
  const pod: any | undefined = data?.result;
  const templateTags: any | undefined = dataTags?.result;
  const templatesAndTags: any | undefined = dataTemplatesAndTags?.result;

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
    const config = tooltipConfigs[templateTab];
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

  const {
    templateNavExpandedItems,
    templateNavSelectedItems,
    activeTemplate,
    activeTemplateTag,
    templateTab,
    templateTagTab,
  } = useSelector((state: RootState) => state.pods);

  const handleTagTabChange = (tab: string) => {
    dispatch(updateState({ templateTagTab: tab }));
  };

  const getCodeMirrorValue = () => {
    switch (templateTab) {
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
    tabValue?: string;
    customOnClick?: () => void;
  };

  const leftButtons: ButtonConfig[] = [
    { id: 'details', label: 'Details', tabValue: 'details' },
    { id: 'detailsTag', label: 'Details Tag', tabValue: 'detailsTag' },
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

  const calculateTimeSinceCreation = (creation_ts: string) => {
    const creationDate = new Date(creation_ts);
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - creationDate.getTime()) / 1000
    );

    if (diffInSeconds < 120) {
      return `${diffInSeconds} seconds since creation`;
    } else if (diffInSeconds < 7200) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minutes since creation`;
    } else if (diffInSeconds < 172800) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hours since creation`;
    } else if (diffInSeconds) {
      // < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} days since creation`;
    } else {
      return '';
    }
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
        <PodsNavigation from="templates" id={objId} id2={tagId} />
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
                    color={templateTab === tabValue ? 'secondary' : 'primary'}
                    size="small"
                    onClick={() => {
                      if (customOnClick) {
                        customOnClick();
                      } else if (tabValue && templateTab !== undefined) {
                        dispatch(updateState({ templateTab: tabValue }));
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
                    color={templateTab === tabValue ? 'secondary' : 'primary'}
                    size="small"
                    onClick={() => {
                      if (customOnClick) {
                        customOnClick();
                      } else if (tabValue && templateTab !== undefined) {
                        dispatch(updateState({ templateTab: tabValue }));
                      }
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </Stack>
            </div>
            <div className={styles['container']}>
              {templateTab === 'tags' ? (
                <div>
                  {!activeTemplate && !activeTemplateTag ? (
                    <PodsCodeMirror
                      value={
                        templateTags && templateTags.length > 0
                          ? JSON.stringify(
                              templateTags.find(
                                (tag: any) =>
                                  tag.tag_timestamp ===
                                  `${activeTemplate}@${activeTemplateTag}`
                              ),
                              null,
                              2
                            )
                          : 'No tag data available.'
                      }
                      isVisible={true}
                    />
                  ) : templateTags && templateTags.length > 0 ? (
                    templateTags.map((tag: any, index: number) => {
                      const [tagName, tagTime] = tag.tag_timestamp.split('@');
                      const timeSinceCreation = calculateTimeSinceCreation(
                        tag.creation_ts
                      );
                      return (
                        <Accordion key={index} defaultExpanded={index === 0}>
                          <AccordionSummary
                            expandIcon={<ExpandMoreRounded />}
                            aria-controls={`tag-content-${index}`}
                            id={`tag-header-${index}`}
                          >
                            <span>{tagName}</span>
                            <span className={styles['secondaryText']}>
                              @{tagTime}
                            </span>
                            <span
                              style={{
                                marginLeft: 'auto',
                                fontSize: '0.8em',
                                color: '#888',
                              }}
                            >
                              {timeSinceCreation}
                            </span>
                          </AccordionSummary>
                          <AccordionDetails>
                            <div>{JSON.stringify(tag, null, 2)}</div>
                          </AccordionDetails>
                        </Accordion>
                      );
                    })
                  ) : (
                    <SectionMessage type="info">
                      No template tags available.
                    </SectionMessage>
                  )}
                </div>
              ) : (
                <PodsCodeMirror
                  value={
                    templateTab === 'details'
                      ? JSON.stringify(pod, null, 2)
                      : JSON.stringify(templateTags, null, 2)
                  }
                  isVisible={true}
                />
              )}
            </div>
          </div>
        )}

        <div>{renderTooltipModal()}</div>
      </div>
    </div>
  );
};

export default PageTemplates;
