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
import { LoadingButton } from '@mui/lab';
import { RefreshRounded } from '@mui/icons-material';
import {
  NavTemplates,
  PodsNavigation,
  PodsCodeMirror,
} from 'app/Pods/_components';
import PodsLoadingText from '../PodsLoadingText';
import { useAppSelector, updateState, useAppDispatch } from '@redux';

const PageTemplates: React.FC<{
  objId: string | undefined;
  tagId: string;
}> = ({ objId, tagId }) => {
  const dispatch = useAppDispatch();
  const { data, isLoading, isFetching, error, invalidate } =
    Hooks.useGetTemplate({
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

  const {
    activeTemplate,
    activeTemplateTag,
    templateTab,
    templateTagTab,
    templateRootTab,
    templateNavSelectedItems,
    templateNavExpandedItems,
  } = useAppSelector((state) => state.pods);

  const loadingText = PodsLoadingText();

  const tooltipConfigs: {
    [key: string]: { tooltipTitle: string; tooltipText: string };
  } = {
    details: {
      tooltipTitle: 'Pod Definition',
      tooltipText:
        'This is the JSON definition of this Pod. Visit our live-docs for an exact schema: https://tapis-project.github.io/live-docs/?service=Pods',
    },
    detailsTag: {
      tooltipTitle: 'Template Tag Details',
      tooltipText:
        'Template tags are templates with a specific version. They are immutable and can be used to create pods.',
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
    const config =
      tooltipConfigs[
        (objId === undefined ? templateRootTab : templateTab) ?? ''
      ];
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

  const handleTagTabChange = (tab: string) => {
    dispatch(updateState({ templateTagTab: tab }));
  };

  const [sharedData, setSharedData] = useState({});

  const getCodeMirrorValue = () => {
    if (objId === undefined) {
      switch (templateRootTab) {
        case 'dashboard':
          return `Templates:
You can manage and create templates here.
A template defines a shareable base pod configuration.

Templates are tenant-scoped. They might not be up-to-date, safe, reviewed, secure, or thought out at all.
Please take caution running templates you're unaware of.
Review the Dockerfile and the image source of a template before use.
Additionally volume mounts and command overrides can be dangerous.

TACC staff can help get you started on creating a template, reach out!

Select or create a template to get started.`;
        case 'createTemplate':
          //return JSON.stringify(sharedData, null, 2);
          return `Create template UI not yet implemented!`;
      }
    } else {
      switch (templateTab) {
        case 'details':
          return error
            ? `error: ${error}`
            : isLoading
            ? loadingText
            : JSON.stringify(pod, null, 2);
        case 'tags':
          if (error) {
            return `error: ${errorTags}`;
          } else if (isLoadingTags) {
            return loadingText;
          } else {
            const matchingTags = templateTags.filter(
              (tag: { tag: string }) => tag.tag === tagId
            );
            return matchingTags.length > 0
              ? JSON.stringify(matchingTags, null, 2)
              : `No matching tags found for tagID: ${tagId}.`;
          }
        case 'detailsTag':
          if (error) {
            return `error: ${errorTags}`;
          } else if (isLoadingTags) {
            return loadingText;
          } else {
            const matchingTag = templateTags.find(
              (tag: { tag_timestamp: string }) => tag.tag_timestamp === tagId
            );
            return matchingTag
              ? JSON.stringify(matchingTag, null, 2)
              : `No matching tag found for tagID: ${tagId}. Looking for tag@timestamp`;
          }
      }
    }
    return `Error: Unrecognized template value. Tell admin.
Template Tab: ${templateTab}
Template Root Tab: ${templateRootTab}
Object ID: ${objId}
Tag ID: ${tagId}
Active Template: ${activeTemplate}
Active Template Tag: ${activeTemplateTag}
templateNavSelectedItems: ${templateNavSelectedItems}
templateNavExpandedItems: ${templateNavExpandedItems}
`;
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
    { id: 'details', label: 'Template Details', tabValue: 'details' },
    // { id: 'tags', label: 'Template Tags', tabValue: 'tags' },
    {
      id: 'detailsTag',
      label: 'Tag Details',
      tabValue: 'detailsTag',
      disabled: !tagId.includes('@'),
    },
    // { id: 'debug', label: 'Debug', tabValue: 'debug' },
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

  const getTabBarButtons = () => {
    if (objId === undefined) {
      return [
        { id: 'dashboard', label: 'Dashboard', tabValue: 'dashboard' },
        {
          id: 'createTemplate',
          label: 'Create Template',
          tabValue: 'createTemplate',
          disabled: true,
        },
      ];
    }
    return leftButtons;
  };

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
                id === 'refresh' && isFetching // || isFetchingLogs || isFetchingSecrets
              }
              key={id}
              variant="outlined"
              disabled={disabled}
              color={
                templateTab === tabValue || templateRootTab === tabValue
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
                    dispatch(updateState({ templateRootTab: tabValue }));
                  } else {
                    dispatch(updateState({ templateTab: tabValue }));
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
        {rightButtons.map(({ id, label, tabValue, customOnClick }) => (
          <Button
            key={id}
            variant="outlined"
            color={
              templateTab === tabValue || templateRootTab === tabValue
                ? 'secondary'
                : 'primary'
            }
            size="small"
            onClick={() => {
              if (customOnClick) {
                customOnClick();
              } else if (tabValue) {
                if (objId === undefined) {
                  dispatch(updateState({ templateRootTab: tabValue }));
                } else {
                  dispatch(updateState({ templateTab: tabValue }));
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
        <PodsNavigation from="templates" id={objId} id2={tagId} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', overflow: 'auto' }}>
        <div style={{}} className={` ${styles['nav']} `}>
          <NavTemplates />
        </div>
        <div
          style={{
            margin: '1rem',
            minWidth: '200px',
            flex: 1,
            overflow: 'auto',
          }}
        >
          {renderTabBar(getTabBarButtons(), rightButtons)}

          <div className={styles['container']}>
            <div>
              <PodsCodeMirror
                // editValue={
                //   templateTab === 'edit'
                //     ? JSON.stringify(sharedData, null, 2)
                //     : ''
                // }
                value={codeMirrorValue?.toString() ?? ''}
                isVisible={true}
                isEditorVisible={
                  // (templateTab === 'edit' && objId !== undefined) ||
                  templateRootTab === 'createTemplate' && objId === undefined
                }
                // editPanel={
                //   templateTab === 'edit' && objId !== undefined ? (
                //     <div> "TNothing yet!"</div>

                //   ) : (
                //     <div />
                //   )
                // }
              />
              {/* {!activeTemplate && !activeTemplateTag ? (
                <div>
                  {templateTab}; {templateRootTab}
                </div>
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
                <div>No tags available.</div>
              )} */}
            </div>
          </div>
        </div>

        <div>{renderTooltipModal()}</div>
      </div>
    </div>
  );
};

export default PageTemplates;
