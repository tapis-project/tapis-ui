import React, { useState, useEffect } from 'react';
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
  SubmitWrapper,
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
  TextField,
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
import { template } from 'lodash';

const PageTemplates: React.FC<{
  objId: string | undefined;
  tagId: string;
}> = ({ objId, tagId }) => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const { data, isLoading, isFetching, error, invalidate } =
    Hooks.useGetTemplate({ templateId: objId }, { enabled: !!objId });
  const {
    data: dataTags,
    isLoading: isLoadingTags,
    error: errorTags,
    invalidate: invalidateTags,
  } = Hooks.useListTemplateTags(
    {
      templateId: objId as string,
      full: true,
    },
    { enabled: !!objId }
  );
  const {
    data: dataTemplatesAndTags,
    isLoading: isLoadingTemplatesAndTags,
    error: errorTemplatesAndTags,
    invalidate: invalidateTemplatesAndTags,
  } = Hooks.useListTemplatesAndTags({
    full: true,
  });

  // Add create hooks
  const {
    createTemplate,
    isLoading: isCreatingTemplate,
    isError: isCreateTemplateError,
    isSuccess: isCreateTemplateSuccess,
    error: createTemplateError,
    reset: resetCreateTemplate,
  } = Hooks.useCreateTemplate();

  const {
    createTemplateTag,
    isLoading: isCreatingTemplateTag,
    isError: isCreateTemplateTagError,
    isSuccess: isCreateTemplateTagSuccess,
    error: createTemplateTagError,
    reset: resetCreateTemplateTag,
  } = Hooks.useCreateTemplateTag();

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
    createTemplateData,
    createTemplateTagData,
    createTemplateTagTemplateId,
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
            console.log(tagId, 'tagId');
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
      customOnClick() {
        return navigator.clipboard.writeText(getCodeMirrorValue() ?? '');
      },
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
        },
        {
          id: 'createTemplateTag',
          label: 'Create Template Tag',
          tabValue: 'createTemplateTag',
        },
      ];
    }
    return leftButtons;
  };

  // Add Create New Tag button to left tab bar group if on detailsTag view
  const getLeftButtons = () => {
    const baseButtons: ButtonConfig[] = [
      { id: 'details', label: 'Template Details', tabValue: 'details' },
      {
        id: 'detailsTag',
        label: 'Tag Details',
        tabValue: 'detailsTag',
        disabled: !tagId.includes('@'),
      },
    ];
    // Only show Create New Tag and Create Pod From Tag if on detailsTag view and a matching tag exists
    if (
      objId &&
      templateTab === 'detailsTag' &&
      templateTags &&
      tagId &&
      tagId.includes('@')
    ) {
      const matchingTag = templateTags.find(
        (tag: { tag_timestamp: string }) => tag.tag_timestamp === tagId
      );
      if (matchingTag) {
        baseButtons.push({
          id: 'createNewTag',
          label: 'Create New Tag',
          customOnClick: () => handleCreateNewTagFromTagDetails(matchingTag),
        });
        // Add Create Pod From Tag button
        baseButtons.push({
          id: 'createPodFromTag',
          label: 'Create Pod From Tag',
          customOnClick: () => handleCreatePodFromTag(matchingTag),
        });
      }
    }
    return baseButtons;
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

  // Ensure createTemplateData is initialized when entering createTemplate tab
  useEffect(() => {
    if (
      templateRootTab === 'createTemplate' &&
      objId === undefined &&
      !createTemplateData
    ) {
      dispatch(
        updateState({
          createTemplateData: {
            template_id: '<fill in template id>',
            description: '<fill in template description>',
            metatags: ['custom'],
          },
        })
      );
    }
  }, [templateRootTab, objId, createTemplateData, dispatch]);

  // Add onChange handlers to update Redux state directly
  const handleTemplateJsonChange = (v: string) => {
    try {
      dispatch(updateState({ createTemplateData: JSON.parse(v) }));
    } catch (e) {
      // Optionally handle JSON parse error
    }
  };
  const handleTemplateTagJsonChange = (v: string) => {
    try {
      dispatch(updateState({ createTemplateTagData: JSON.parse(v) }));
    } catch (e) {
      // Optionally handle JSON parse error
    }
  };

  // Submit handlers
  const handleSubmitTemplate = () => {
    if (createTemplateData) {
      createTemplate(
        { newTemplate: createTemplateData },
        {
          onSuccess: () => {
            // Optionally redirect or show success message
            console.log('Template created successfully');
            invalidateTemplatesAndTags();
            //dispatch(updateState({ templateRootTab: 'dashboard' }));
          },
          onError: (error) => {
            console.error('Error creating template:', error);
          },
        }
      );
    }
  };

  const handleSubmitTemplateTag = () => {
    if (createTemplateTagData && createTemplateTagTemplateId) {
      createTemplateTag(
        {
          templateId: createTemplateTagTemplateId,
          newTemplateTag: createTemplateTagData,
        },
        {
          onSuccess: () => {
            // Optionally redirect or show success message
            console.log('Template tag created successfully');
            invalidateTemplatesAndTags();
            //dispatch(updateState({ templateRootTab: 'dashboard' }));
          },
          onError: (error) => {
            console.error('Error creating template tag:', error);
          },
        }
      );
    }
  };

  // Handler for Create New Tag from tag details
  // this needs to get rid of a few extra fields or empties. Such as deleting tagObj['pod_definition']['creation_ts'] if it exists
  const handleCreateNewTagFromTagDetails = (tagObj: any) => {
    // Remove some extra returned fields
    const templateIdForTag = tagObj.template_id;
    delete tagObj.creation_ts;
    delete tagObj.tag_timestamp;
    delete tagObj.added_by;
    delete tagObj.template_id;
    dispatch(
      updateState({
        templateRootTab: 'createTemplateTag',
        createTemplateTagData: tagObj,
        createTemplateTagTemplateId: templateIdForTag,
      })
    );
    history.push('/pods/templates');
  };

  // Handler for Create Pod From Tag
  const handleCreatePodFromTag = (tagObj: any) => {
    // Prefill pod creation form with pod_definition from tagObj
    const podDef = tagObj.pod_definition || {};
    dispatch(
      updateState({
        podRootTab: 'createPod',
        podEditTab: 'form',
        createPodData: {
          template: tagObj.template_id + ':' + tagObj.tag_timestamp,
        },
      })
    );
    history.push('/pods');
  };

  // Add createTemplate and createTemplateTag pages using PodsCodeMirror for preview
  const renderCreateTemplate = () => (
    <div style={{ display: 'flex', flexDirection: 'row', gap: '2rem' }}>
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '8px',
          }}
        >
          <SubmitWrapper
            isLoading={isCreatingTemplate}
            error={createTemplateError}
            success={
              isCreateTemplateSuccess
                ? 'Template created successfully!'
                : undefined
            }
            reverse={true}
          >
            <LoadingButton
              variant="outlined"
              color="primary"
              size="small"
              loading={isCreatingTemplate}
              onClick={handleSubmitTemplate}
              disabled={!createTemplateData}
            >
              Submit Template
            </LoadingButton>
          </SubmitWrapper>
        </div>
        <PodsCodeMirror
          value={
            createTemplateData
              ? JSON.stringify(createTemplateData, null, 2)
              : JSON.stringify(
                  {
                    template_id: '<fill in template id>',
                    description: '<fill in template description>',
                    metatags: ['custom'],
                  },
                  null,
                  2
                )
          }
          height="400px"
          //extensions={[json()]}
          //theme={vscodeDark}
          isVisible={true}
          editable={true}
          onChange={handleTemplateJsonChange}
        />
      </div>
    </div>
  );

  const renderCreateTemplateTag = () => (
    <div style={{ display: 'flex', flexDirection: 'row', gap: '2rem' }}>
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}
        >
          <TextField
            id="template-id-input"
            label="Template ID"
            size="small"
            margin="none"
            variant="outlined"
            value={createTemplateTagTemplateId || ''}
            onChange={(e) =>
              dispatch(
                updateState({ createTemplateTagTemplateId: e.target.value })
              )
            }
            InputLabelProps={
              { style: { fontSize: '0.8rem' } } // Adjust label font size
            }
            inputProps={{
              style: {
                height: '1rem',
                fontSize: '0.9rem', // Adjust font size to match MUI's small variant
                margin: '0rem',
              },
            }}
          />
          <SubmitWrapper
            isLoading={isCreatingTemplateTag}
            error={createTemplateTagError}
            success={
              isCreateTemplateTagSuccess
                ? 'Template tag created successfully!'
                : undefined
            }
            reverse={true}
          >
            <LoadingButton
              variant="outlined"
              color="primary"
              size="small"
              loading={isCreatingTemplateTag}
              onClick={handleSubmitTemplateTag}
              disabled={!createTemplateTagData}
            >
              Submit Template Tag
            </LoadingButton>
          </SubmitWrapper>
        </div>
        <PodsCodeMirror
          value={
            createTemplateTagData
              ? JSON.stringify(createTemplateTagData, null, 2)
              : '{}'
          }
          height="400px"
          isVisible={true}
          editable={true}
          //extensions={[json()]}
          //theme={vscodeDark}
          onChange={handleTemplateTagJsonChange}
        />
      </div>
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
          {renderTabBar(
            objId === undefined ? getTabBarButtons() : getLeftButtons(),
            rightButtons
          )}

          <div className={styles['container']}>
            <div>
              {/* Render create template/tag editors if on those tabs */}
              {templateRootTab === 'createTemplate' && objId === undefined
                ? renderCreateTemplate()
                : templateRootTab === 'createTemplateTag' && objId === undefined
                ? renderCreateTemplateTag()
                : null}
              {/* Default code mirror for other views */}
              {!(templateRootTab === 'createTemplate' && objId === undefined) &&
                !(
                  templateRootTab === 'createTemplateTag' && objId === undefined
                ) && (
                  <PodsCodeMirror
                    value={codeMirrorValue?.toString() ?? ''}
                    isVisible={true}
                    isEditorVisible={
                      templateRootTab === 'createTemplate' &&
                      objId === undefined
                    }
                  />
                )}
            </div>
          </div>
        </div>

        <div>{renderTooltipModal()}</div>
      </div>
    </div>
  );
};

export default PageTemplates;
