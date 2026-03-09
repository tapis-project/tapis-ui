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
  Box,
  Typography,
  Chip,
  Paper,
  FormControlLabel,
  Checkbox,
  Tooltip,
  IconButton,
} from '@mui/material';
import { ExpandMoreRounded } from '@mui/icons-material';
import styles from '../Pages.module.scss';
import ButtonGroup from '@mui/material/ButtonGroup';
import { LoadingButton } from '@mui/lab';
import { RefreshRounded, WarningAmber } from '@mui/icons-material';
import {
  NavTemplates,
  PodsNavigation,
  PodsCodeMirror,
} from 'app/Pods/_components';
import {
  DeleteTemplateTagModal,
  DeleteTemplateModal,
  TemplatePermissionModal,
} from 'app/Pods/_components/Modals';
import PodsLoadingText from '../PodsLoadingText';
import { useAppSelector, updateState, useAppDispatch } from '@redux';
import { template } from 'lodash';
import ReactMarkdown from 'react-markdown';

// Helper function to parse and format ResponseValidationError messages
const parseValidationError = (errorMessage: string): string => {
  // Check if it's a ResponseValidationError
  if (!errorMessage.includes('ResponseValidationError')) {
    return errorMessage;
  }

  try {
    // Extract the debug array from the error message
    const debugMatch = errorMessage.match(/debug: \[(.+)\]$/s);
    if (!debugMatch) {
      return errorMessage;
    }

    // Parse out individual error entries using regex to find 'msg' fields
    const msgMatches = errorMessage.matchAll(/'msg':\s*["']([^"']+)["']/g);
    const locMatches = errorMessage.matchAll(
      /'loc':\s*\([^)]*'result',\s*(\d+)/g
    );

    const msgs = [...msgMatches].map((m) => m[1]);
    const locs = [...locMatches].map((m) => parseInt(m[1]));

    if (msgs.length === 0) {
      return errorMessage;
    }

    // Group errors by unique message to avoid repetition
    const uniqueErrors = new Map<string, number[]>();
    msgs.forEach((msg, i) => {
      const loc = locs[i] ?? i;
      if (!uniqueErrors.has(msg)) {
        uniqueErrors.set(msg, []);
      }
      uniqueErrors.get(msg)!.push(loc);
    });

    // Format the output
    let formatted = 'Validation Errors Found:\n\n';
    uniqueErrors.forEach((indices, msg) => {
      const tagIndices = indices.map((i) => `tag[${i}]`).join(', ');
      formatted += `• ${tagIndices}: ${msg}\n\n`;
    });

    return formatted;
  } catch (e) {
    // If parsing fails, return original message
    return errorMessage;
  }
};

const PageTemplates: React.FC<{
  objId: string | undefined;
  tagId: string;
}> = ({ objId, tagId }) => {
  const dispatch = useAppDispatch();
  const history = useHistory();

  // State for include_dependencies toggle
  const [includeDependencies, setIncludeDependencies] = useState(false);

  // State for include_configs toggle (default to false for viewing)
  const [includeConfigs, setIncludeConfigs] = useState(false);

  const { data, isLoading, isFetching, error, invalidate } =
    Hooks.useGetTemplate({ templateId: objId ?? '' }, { enabled: !!objId });
  const {
    data: dataTags,
    isLoading: isLoadingTags,
    error: errorTags,
    invalidate: invalidateTags,
  } = Hooks.useListTemplateTags(
    {
      templateId: objId as string,
      full: true,
      includeDependencies: includeDependencies,
      includeConfigs: includeConfigs,
    },
    { enabled: !!objId }
  );

  // Separate query that always includes configs - used for "Create New Tag From Existing"
  const { data: dataTagsWithConfigs } = Hooks.useListTemplateTags(
    {
      templateId: objId as string,
      full: true,
      includeConfigs: true,
    },
    { enabled: !!objId }
  );
  const templateTagsWithConfigs: any | undefined = dataTagsWithConfigs?.result;

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

  // Add update template hook
  const {
    updateTemplate,
    isLoading: isUpdatingTemplate,
    isError: isUpdateTemplateError,
    isSuccess: isUpdateTemplateSuccess,
    error: updateTemplateError,
    reset: resetUpdateTemplate,
  } = Hooks.useUpdateTemplate(objId || '');

  // Template permissions hooks
  const {
    data: dataPerms,
    isLoading: isLoadingPerms,
    isFetching: isFetchingPerms,
    error: errorPerms,
    invalidate: invalidatePerms,
  } = Hooks.useGetTemplatePermissions(
    { templateId: objId ?? '' },
    { enabled: !!objId }
  );
  const { deleteTemplatePermission, isLoading: isDeletingPermission } =
    Hooks.useDeleteTemplatePermission();

  const tooltipText =
    'Pods saves pod interactions in an Action Logs ledger. User and system interaction with your pod is logged here.';
  const pod: any | undefined = data?.result;
  const templateTags: any | undefined = dataTags?.result;
  const templatesAndTags: any | undefined = dataTemplatesAndTags?.result;
  const templatePerms: Pods.TemplatePermissionsResponse | undefined =
    dataPerms?.result as Pods.TemplatePermissionsResponse | undefined;

  const [modal, setModal] = useState<string | undefined>(undefined);
  const toggle = () => {
    setModal(undefined);
  };

  // State for delete template tag modal
  const [deleteTagModalOpen, setDeleteTagModalOpen] = useState(false);
  const [deleteTagInfo, setDeleteTagInfo] = useState<{
    templateId: string;
    tagTimestamp: string;
    tagName: string;
    dependentPods: string[];
  } | null>(null);

  // State for delete template modal
  const [deleteTemplateModalOpen, setDeleteTemplateModalOpen] = useState(false);
  const [deleteTemplateInfo, setDeleteTemplateInfo] = useState<{
    templateId: string;
    dependentPods: string[];
    dependentTags: string[];
  } | null>(null);

  // Add state for edit mode
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [editedTemplateData, setEditedTemplateData] = useState<any>(null);

  // JSON validation state for create forms
  const [templateJsonError, setTemplateJsonError] = useState<string | null>(
    null
  );
  const [templateTagJsonError, setTemplateTagJsonError] = useState<
    string | null
  >(null);

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
    perms: {
      tooltipTitle: 'Permissions',
      tooltipText:
        'Permissions are the access control list for this Template. There are 3 levels: READ, USER, and ADMIN.',
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
          if (isEditingTemplate && editedTemplateData) {
            return JSON.stringify(editedTemplateData, null, 2);
          }
          return error
            ? `error: ${error.message || error}`
            : isLoading
            ? loadingText
            : JSON.stringify(pod, null, 2);
        case 'tags':
          if (errorTags) {
            return parseValidationError(errorTags.message || String(errorTags));
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
          if (errorTags) {
            return parseValidationError(errorTags.message || String(errorTags));
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
        case 'perms':
          return errorPerms
            ? `error: ${errorPerms}`
            : isFetchingPerms
            ? loadingText
            : JSON.stringify(templatePerms, null, 2);
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

    // Add Edit/Save/Cancel buttons when viewing template details
    if (objId && templateTab === 'details' && pod) {
      if (isEditingTemplate) {
        baseButtons.push({
          id: 'saveTemplate',
          label: 'Save',
          customOnClick: () => handleSaveTemplate(),
        });
        baseButtons.push({
          id: 'cancelEdit',
          label: 'Cancel',
          customOnClick: () => handleCancelEdit(),
        });
      } else {
        baseButtons.push({
          id: 'editTemplate',
          label: 'Edit',
          customOnClick: () => handleEditTemplate(),
        });
      }
    }

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
          label: 'Create New Tag From Existing',
          customOnClick: () => {
            // Use the tag data with configs included for creating new tag
            const matchingTagWithConfigs = templateTagsWithConfigs?.find(
              (tag: { tag_timestamp: string }) => tag.tag_timestamp === tagId
            );
            handleCreateNewTagFromTagDetails(
              matchingTagWithConfigs || matchingTag
            );
          },
        });
        // Add Create Pod From Tag button
        baseButtons.push({
          id: 'createPodFromTag',
          label: 'Create Pod From Tag',
          customOnClick: () => handleCreatePodFromTag(matchingTag),
        });
      }
    }

    // Add Perms button when viewing a template
    if (objId) {
      baseButtons.push({
        id: 'perms',
        label: 'Perms',
        tabValue: 'perms',
      });
    }

    // Add Copy Template button when viewing template details
    if (objId && templateTab === 'details' && pod) {
      baseButtons.push({
        id: 'copyTemplate',
        label: 'Create Template From Existing',
        customOnClick: () => handleCopyTemplate(),
      });
    }
    return baseButtons;
  };

  // Handle delete permission for a single user
  const handleDeletePermission = (user: string) => {
    if (!objId) return;
    deleteTemplatePermission(
      { templateId: objId, user },
      {
        onSuccess: () => {
          invalidatePerms();
        },
      }
    );
  };

  // Handle copy/clone template
  const handleCopyTemplate = () => {
    if (!pod) return;
    const templateCopy = { ...pod };
    // Remove fields that shouldn't be copied
    delete templateCopy.creation_ts;
    delete templateCopy.update_ts;
    delete templateCopy.tenant_id;
    delete templateCopy.site_id;
    // Prefix template_id to indicate it's a copy
    templateCopy.template_id = `${pod.template_id}-copy`;
    dispatch(
      updateState({
        templateRootTab: 'createTemplate',
        createTemplateData: templateCopy,
      })
    );
    history.push('/pods/templates');
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
        overflowX: 'auto',
        overflowY: 'hidden',
        flexWrap: 'nowrap',
        flexShrink: 0,
      }}
    >
      <Stack
        spacing={2}
        direction="row"
        sx={{ flexShrink: 0, flexWrap: 'nowrap' }}
      >
        {leftButtons.map(
          ({ id, label, tabValue, customOnClick, icon, disabled }) => {
            // Special rendering for perms button with + add button
            if (id === 'perms') {
              return (
                <ButtonGroup key={id} variant="outlined" size="small">
                  <LoadingButton
                    sx={{ minWidth: '60px', whiteSpace: 'nowrap' }}
                    variant="outlined"
                    color={templateTab === 'perms' ? 'secondary' : 'primary'}
                    size="small"
                    onClick={() => {
                      invalidate();
                      dispatch(updateState({ templateTab: 'perms' }));
                    }}
                  >
                    Perms
                  </LoadingButton>
                  {templateTab === 'perms' && (
                    <Button
                      onClick={() => setModal('templatePermissions')}
                      color="primary"
                      sx={{
                        fontSize: '14px',
                        minWidth: '28px !important',
                        width: '28px',
                      }}
                      variant="outlined"
                    >
                      +
                    </Button>
                  )}
                </ButtonGroup>
              );
            }
            return (
              <LoadingButton
                sx={{ minWidth: '10px', whiteSpace: 'nowrap' }}
                loading={
                  (id === 'refresh' && isFetching) ||
                  (id === 'saveTemplate' && isUpdatingTemplate)
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
            );
          }
        )}
      </Stack>

      <Stack
        spacing={2}
        direction="row"
        sx={{ flexShrink: 0, flexWrap: 'nowrap', ml: 2 }}
      >
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
            sx={{ whiteSpace: 'nowrap' }}
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

  // Reset update state on success
  useEffect(() => {
    if (isUpdateTemplateSuccess) {
      const timer = setTimeout(() => {
        resetUpdateTemplate();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isUpdateTemplateSuccess, resetUpdateTemplate]);

  // Sync templateTab based on URL tagId - when navigating to a tag URL, set detailsTag tab
  useEffect(() => {
    if (objId !== undefined) {
      if (tagId && tagId.includes('@')) {
        // URL has a full tag timestamp - switch to detailsTag view
        dispatch(updateState({ templateTab: 'detailsTag' }));
        // Also update nav selected item to highlight the correct tag in the tree
        // Format: templateId::prefix::timestamp (e.g., "headplane::0.6.1::2026-02-04-07:05:53")
        const [prefix, timestamp] = tagId.split('@');
        if (prefix && timestamp) {
          const navItemId = `${objId}::${prefix}::${timestamp}`;
          dispatch(updateState({ templateNavSelectedItems: navItemId }));
          // Expand parent items in the tree, preserving existing expanded items
          const newExpandedItems = [objId, `${objId}::${prefix}`];
          const currentExpanded = templateNavExpandedItems || [];
          const mergedExpanded = [
            ...new Set([...currentExpanded, ...newExpandedItems]),
          ];
          dispatch(updateState({ templateNavExpandedItems: mergedExpanded }));
        }
      } else if (!tagId || tagId === '') {
        // No tag in URL - switch to details view
        dispatch(updateState({ templateTab: 'details' }));
      }
    }
  }, [objId, tagId, dispatch]);

  // Add onChange handlers to update Redux state directly
  const handleTemplateJsonChange = (v: string) => {
    try {
      dispatch(updateState({ createTemplateData: JSON.parse(v) }));
      setTemplateJsonError(null);
    } catch (e: any) {
      setTemplateJsonError(e.message || 'Invalid JSON');
    }
  };
  const handleTemplateTagJsonChange = (v: string) => {
    try {
      dispatch(updateState({ createTemplateTagData: JSON.parse(v) }));
      setTemplateTagJsonError(null);
    } catch (e: any) {
      setTemplateTagJsonError(e.message || 'Invalid JSON');
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
    // Remove fields not used on create
    delete tagObj.description;
    delete tagObj.archive_message;
    delete tagObj.tenant_id;
    delete tagObj.site_id;
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

  // Handler for editing template
  const handleEditTemplate = () => {
    setIsEditingTemplate(true);
    setEditedTemplateData(pod);
  };

  // Handler for saving template updates
  const handleSaveTemplate = () => {
    if (editedTemplateData && objId) {
      updateTemplate(
        {
          templateId: objId,
          updateTemplate: editedTemplateData,
        },
        {
          onSuccess: () => {
            console.log('Template updated successfully');
            setIsEditingTemplate(false);
            invalidate();
            invalidateTemplatesAndTags();
          },
          onError: (error) => {
            console.error('Error updating template:', error);
          },
        }
      );
    }
  };

  // Handler for canceling template edit
  const handleCancelEdit = () => {
    setIsEditingTemplate(false);
    setEditedTemplateData(null);
  };

  // Handler for template JSON changes during edit
  const handleEditTemplateJsonChange = (v: string) => {
    try {
      setEditedTemplateData(JSON.parse(v));
    } catch (e) {
      // Optionally handle JSON parse error
    }
  };

  // Add createTemplate and createTemplateTag pages using PodsCodeMirror for preview
  const renderCreateTemplate = () => (
    <div style={{ display: 'flex', flexDirection: 'row', gap: '2rem' }}>
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginBottom: '8px',
          }}
        >
          {templateJsonError && (
            <Tooltip
              title={`Invalid JSON: ${templateJsonError}`}
              arrow
              placement="left"
            >
              <WarningAmber
                sx={{
                  color: '#ed6c02',
                  fontSize: '1.4rem',
                  cursor: 'help',
                  mr: 1,
                }}
              />
            </Tooltip>
          )}
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
              disabled={!createTemplateData || !!templateJsonError}
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
          {templateTagJsonError && (
            <Tooltip
              title={`Invalid JSON: ${templateTagJsonError}`}
              arrow
              placement="left"
            >
              <WarningAmber
                sx={{
                  color: '#ed6c02',
                  fontSize: '1.4rem',
                  cursor: 'help',
                  mr: 1,
                }}
              />
            </Tooltip>
          )}
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
              disabled={!createTemplateTagData || !!templateTagJsonError}
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

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    // Ensure timestamp is treated as UTC by appending Z if it's an ISO format without timezone
    let normalizedTimestamp = timestamp;
    if (
      timestamp.includes('T') &&
      !timestamp.endsWith('Z') &&
      !timestamp.includes('+')
    ) {
      normalizedTimestamp = timestamp + 'Z';
    }
    const time = new Date(normalizedTimestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 120) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const diffInHours = Math.floor(diffInSeconds / 3600);
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInSeconds / 86400);
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
  };

  // Add helper function to render template info box
  const renderTemplateInfoBox = () => {
    if (objId === undefined) return null;

    if (templateTab === 'details' && pod) {
      // Calculate total template usage across all tags
      const calculateTemplateUsage = () => {
        if (!templateTags || !Array.isArray(templateTags)) {
          return {
            totalPods: 0,
            totalTags: 0,
            allPods: [] as string[],
            allTags: [] as string[],
            perTagUsage: [] as Array<{
              tagTimestamp: string;
              pods: string[];
              tags: string[];
            }>,
          };
        }

        const allPods = new Set<string>();
        const allTags = new Set<string>();
        const perTagUsage: Array<{
          tagTimestamp: string;
          pods: string[];
          tags: string[];
        }> = [];

        templateTags.forEach((tag: any) => {
          const tagPods: string[] = [];
          const tagTags: string[] = [];

          if (tag.dependents) {
            if (tag.dependents.dependant_pods) {
              tag.dependents.dependant_pods.forEach((podId: string) => {
                allPods.add(podId);
                tagPods.push(podId);
              });
            }
            if (tag.dependents.dependant_tags) {
              tag.dependents.dependant_tags.forEach((tagRef: string) => {
                allTags.add(tagRef);
                tagTags.push(tagRef);
              });
            }
          }

          // Only add to perTagUsage if this tag has dependents
          if (tagPods.length > 0 || tagTags.length > 0) {
            perTagUsage.push({
              tagTimestamp: tag.tag_timestamp,
              pods: tagPods,
              tags: tagTags,
            });
          }
        });

        return {
          totalPods: allPods.size,
          totalTags: allTags.size,
          allPods: Array.from(allPods),
          allTags: Array.from(allTags),
          perTagUsage,
        };
      };

      const templateUsage = includeDependencies
        ? calculateTemplateUsage()
        : null;

      return (
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            mb: 1,
            border: '1px solid rgba(112, 112, 112, 0.25)',
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 1,
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
              {pod.template_id || 'Untitled Template'}
            </Typography>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => {
                // Calculate dependencies for the template
                const allPods = new Set<string>();
                const allTagTimestamps: string[] = [];
                if (templateTags && Array.isArray(templateTags)) {
                  templateTags.forEach((tag: any) => {
                    allTagTimestamps.push(tag.tag_timestamp);
                    if (tag.dependents?.dependant_pods) {
                      tag.dependents.dependant_pods.forEach((podId: string) =>
                        allPods.add(podId)
                      );
                    }
                  });
                }
                setDeleteTemplateInfo({
                  templateId: pod.template_id,
                  dependentPods: Array.from(allPods),
                  dependentTags: allTagTimestamps,
                });
                setDeleteTemplateModalOpen(true);
              }}
            >
              Delete Template
            </Button>
          </Box>
          {pod.metatags && pod.metatags.length > 0 && (
            <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {pod.metatags.map((tag: string, index: number) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  color="primary"
                  sx={{ borderRadius: 1 }}
                />
              ))}
            </Box>
          )}
          {pod.archive_message && (
            <Box
              sx={{
                mt: 1,
                mb: 1,
                p: 1.5,
                pb: 0,
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                border: '1px solid rgba(255, 152, 0, 0.4)',
                borderRadius: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 'bold', mb: 0.5, color: 'warning.dark' }}
              >
                Template set to archived by administrator
              </Typography>
              <Typography variant="body2" component="div">
                <ReactMarkdown>{pod.archive_message}</ReactMarkdown>
              </Typography>
            </Box>
          )}
          {pod.description && (
            <Box
              sx={{
                '& p': { margin: '0.5em 0' },
                '& p:first-of-type': { marginTop: 0 },
                '& p:last-child': { marginBottom: 0 },
              }}
            >
              <ReactMarkdown>{pod.description}</ReactMarkdown>
            </Box>
          )}

          {/* Template Usage Summary - show when include_dependencies is enabled */}
          {includeDependencies && templateUsage && (
            <Box
              sx={{
                mt: 2,
                pt: 2,
                borderTop: '1px solid rgba(112, 112, 112, 0.15)',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1.5,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 'bold', display: 'block' }}
                >
                  TEMPLATE USAGE (across current{' '}
                  <code
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.06)',
                      padding: '1px 4px',
                      borderRadius: '3px',
                      fontFamily: 'monospace',
                    }}
                  >
                    {pod.template_id}
                  </code>{' '}
                  tags)
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {templateUsage.totalPods} pod
                      {templateUsage.totalPods !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: 'secondary.main',
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {templateUsage.totalTags} tag
                      {templateUsage.totalTags !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {templateUsage.perTagUsage.length > 0 ? (
                <Box
                  sx={{
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: '1px solid rgba(112, 112, 112, 0.15)',
                  }}
                >
                  {templateUsage.perTagUsage.map((tagUsage, index) => (
                    <Box
                      key={tagUsage.tagTimestamp}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 2fr',
                        borderBottom:
                          index < templateUsage.perTagUsage.length - 1
                            ? '1px solid rgba(112, 112, 112, 0.1)'
                            : 'none',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        },
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      {/* Tag name column */}
                      <Box
                        sx={{
                          p: 1,
                          borderRight: '1px solid rgba(112, 112, 112, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Typography
                          component="a"
                          href={`/#/pods/templates/${objId}/tags/${tagUsage.tagTimestamp}`}
                          variant="body2"
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            textDecoration: 'none',
                            color: 'inherit',
                            '&:hover': {
                              color: 'primary.main',
                            },
                          }}
                        >
                          {tagUsage.tagTimestamp}
                        </Typography>
                      </Box>

                      {/* Dependents column */}
                      <Box
                        sx={{
                          p: 1,
                          display: 'flex',
                          gap: 0.5,
                          flexWrap: 'wrap',
                          alignItems: 'center',
                        }}
                      >
                        {tagUsage.pods.map((podId) => (
                          <Tooltip
                            key={`pod-${podId}`}
                            title={`pod: ${podId}`}
                            arrow
                          >
                            <Chip
                              component="a"
                              href={`/#/pods/${podId}`}
                              label={podId}
                              size="small"
                              variant="outlined"
                              color="primary"
                              clickable
                              sx={{
                                borderRadius: 1,
                                fontSize: '0.75rem',
                                textDecoration: 'none',
                              }}
                            />
                          </Tooltip>
                        ))}
                        {tagUsage.tags.map((tagRef) => {
                          // Parse tag reference to create link (format: template_id:tag_timestamp)
                          // Only split on first colon since tag_timestamp can contain colons (e.g., HH:mm:ss)
                          const colonIndex = tagRef.indexOf(':');
                          const templateId =
                            colonIndex > -1
                              ? tagRef.substring(0, colonIndex)
                              : tagRef;
                          const tagTimestamp =
                            colonIndex > -1
                              ? tagRef.substring(colonIndex + 1)
                              : '';
                          const tagPath = tagTimestamp
                            ? `/#/pods/templates/${templateId}/tags/${tagTimestamp}`
                            : `/#/pods/templates/${templateId}`;
                          return (
                            <Tooltip
                              key={`tag-${tagRef}`}
                              title={`tag: ${tagRef}`}
                              arrow
                            >
                              <Chip
                                component="a"
                                href={tagPath}
                                label={tagRef}
                                size="small"
                                variant="outlined"
                                color="secondary"
                                clickable
                                sx={{
                                  borderRadius: 1,
                                  fontSize: '0.75rem',
                                  textDecoration: 'none',
                                }}
                              />
                            </Tooltip>
                          );
                        })}
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}
                >
                  No pods or tags are currently using this template's tags
                </Typography>
              )}
            </Box>
          )}
        </Paper>
      );
    }

    if (templateTab === 'detailsTag' && templateTags && tagId.includes('@')) {
      const matchingTag = templateTags.find(
        (tag: { tag_timestamp: string }) => tag.tag_timestamp === tagId
      );
      if (matchingTag) {
        return (
          <>
            {/* Template Info Box */}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                mb: 1,
                border: '1px solid rgba(112, 112, 112, 0.25)',
                borderRadius: 2,
              }}
            >
              <Typography variant="h5" gutterBottom>
                {pod?.template_id ||
                  matchingTag.template_id ||
                  'Untitled Template'}
              </Typography>
              {pod?.metatags && pod.metatags.length > 0 && (
                <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {pod.metatags.map((tag: string, index: number) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      color="primary"
                      sx={{ borderRadius: 1 }}
                    />
                  ))}
                </Box>
              )}
              {pod.archive_message && (
                <Box
                  sx={{
                    mt: 1,
                    mb: 1,
                    p: 1.5,
                    pb: 0,
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    border: '1px solid rgba(255, 152, 0, 0.4)',
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 'bold', mb: 0.5, color: 'warning.dark' }}
                  >
                    Template set to archived by administrator
                  </Typography>
                  <Typography variant="body2" component="div">
                    <ReactMarkdown>{pod.archive_message}</ReactMarkdown>
                  </Typography>
                </Box>
              )}
              {pod?.description && (
                <Box
                  sx={{
                    '& p': { margin: '0.5em 0' },
                    '& p:first-of-type': { marginTop: 0 },
                    '& p:last-child': { marginBottom: 0 },
                  }}
                >
                  <ReactMarkdown>{pod.description}</ReactMarkdown>
                </Box>
              )}
            </Paper>

            {/* Template Tag Info Box */}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                mb: 1,
                border: '1px solid rgba(112, 112, 112, 0.25)',
                borderRadius: 2,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 2,
                }}
              >
                {/* Left side - Template Tag info */}
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}
                  >
                    TEMPLATE TAG
                  </Typography>

                  <Typography
                    //variant="caption"
                    sx={{
                      fontWeight: 'bold',
                      fontSize: '110%',
                      display: 'block',
                      mb: 1,
                    }}
                  >
                    {matchingTag.tag}
                  </Typography>

                  {matchingTag.creation_ts && matchingTag.added_by && (
                    <Typography variant="body2" color="text.secondary">
                      Defined{' '}
                      <strong>{formatTimeAgo(matchingTag.creation_ts)}</strong>{' '}
                      by {matchingTag.added_by}
                    </Typography>
                  )}
                  {matchingTag.commit_message && (
                    <Typography variant="body2" component="div">
                      <ReactMarkdown>
                        {matchingTag.commit_message}
                      </ReactMarkdown>
                    </Typography>
                  )}
                </Box>

                {/* Right side - Template Reference Box */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        mt: 3,
                        p: 1.5,
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        border: '1px solid rgba(112, 112, 112, 0.2)',
                        borderRadius: 1,
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        maxWidth: '400px',
                        overflow: 'auto',
                        //textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {matchingTag.template_id}:{matchingTag.tag_timestamp}
                    </Paper>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        minWidth: 'auto',
                        px: 1,
                        mt: 3,
                        minHeight: '2.8rem',
                      }}
                      onClick={() =>
                        navigator.clipboard.writeText(
                          `${matchingTag.template_id}:${matchingTag.tag_timestamp}`
                        )
                      }
                    >
                      copy
                    </Button>
                  </Box>
                  {/* create pod from template button */}
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleCreatePodFromTag(matchingTag)}
                  >
                    Create Pod From Tag
                  </Button>
                  {/* Delete tag button */}
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => {
                      setDeleteTagInfo({
                        templateId: matchingTag.template_id,
                        tagTimestamp: matchingTag.tag_timestamp,
                        tagName: matchingTag.tag,
                        dependentPods:
                          matchingTag.dependents?.dependant_pods || [],
                      });
                      setDeleteTagModalOpen(true);
                    }}
                  >
                    Delete Tag
                  </Button>
                </Box>
              </Box>

              {/* Inline 4-Section Dependencies Display - show when include_dependencies is enabled */}
              {includeDependencies && matchingTag.dependents && (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 1.5,
                    mt: 2,
                    pt: 2,
                    borderTop: '1px solid rgba(112, 112, 112, 0.15)',
                  }}
                >
                  {/* Section 1: Dependent Pods Count */}
                  <Box
                    sx={{
                      textAlign: 'center',
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: 'rgba(0, 0, 0, 0.03)',
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 'bold', color: 'primary.main' }}
                    >
                      {matchingTag.dependents.dependant_pod_count || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Pods
                    </Typography>
                  </Box>

                  {/* Section 2: Dependent Pods Names */}
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: 'rgba(0, 0, 0, 0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    {matchingTag.dependents.dependant_pods?.length > 0 ? (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {matchingTag.dependents.dependant_pods
                          .slice(0, 3)
                          .map((podId: string, index: number) => (
                            <Chip
                              key={index}
                              label={podId}
                              size="small"
                              variant="outlined"
                              color="primary"
                              onClick={() => history.push(`/pods/${podId}`)}
                              sx={{
                                cursor: 'pointer',
                                fontSize: '0.7rem',
                                borderRadius: 1,
                              }}
                            />
                          ))}
                        {matchingTag.dependents.dependant_pods.length > 3 && (
                          <Chip
                            label={`+${
                              matchingTag.dependents.dependant_pods.length - 3
                            }`}
                            size="small"
                            variant="filled"
                            color="primary"
                            sx={{ fontSize: '0.7rem', borderRadius: 1 }}
                          />
                        )}
                      </Box>
                    ) : (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontStyle: 'italic' }}
                      >
                        None
                      </Typography>
                    )}
                  </Box>

                  {/* Section 3: Dependent Tags Count */}
                  <Box
                    sx={{
                      textAlign: 'center',
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: 'rgba(0, 0, 0, 0.03)',
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 'bold', color: 'secondary.main' }}
                    >
                      {matchingTag.dependents.dependant_tags_count || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tags
                    </Typography>
                  </Box>

                  {/* Section 4: Dependent Tags Names */}
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: 'rgba(0, 0, 0, 0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    {matchingTag.dependents.dependant_tags?.length > 0 ? (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {matchingTag.dependents.dependant_tags
                          .slice(0, 3)
                          .map((tagRef: string, index: number) => (
                            <Chip
                              key={index}
                              label={tagRef}
                              size="small"
                              variant="outlined"
                              color="secondary"
                              sx={{ fontSize: '0.7rem', borderRadius: 1 }}
                            />
                          ))}
                        {matchingTag.dependents.dependant_tags.length > 3 && (
                          <Chip
                            label={`+${
                              matchingTag.dependents.dependant_tags.length - 3
                            }`}
                            size="small"
                            variant="filled"
                            color="secondary"
                            sx={{ fontSize: '0.7rem', borderRadius: 1 }}
                          />
                        )}
                      </Box>
                    ) : (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontStyle: 'italic' }}
                      >
                        None
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
            </Paper>
          </>
        );
      }
    }

    return null;
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

          {/* Include Dependencies and View Configs checkboxes - show when viewing template details or tags */}
          {objId &&
            (templateTab === 'detailsTag' || templateTab === 'details') && (
              <Box
                sx={{
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  flexWrap: 'wrap',
                  flexShrink: 0,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeDependencies}
                      onChange={(e) => setIncludeDependencies(e.target.checked)}
                      size="small"
                      sx={{ py: 0 }}
                    />
                  }
                  label={
                    <Typography variant="body2" noWrap>
                      Include Dependencies
                    </Typography>
                  }
                  sx={{ mr: 0 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeConfigs}
                      onChange={(e) => setIncludeConfigs(e.target.checked)}
                      size="small"
                      sx={{ py: 0 }}
                    />
                  }
                  label={
                    <Typography variant="body2" noWrap>
                      View Configs
                    </Typography>
                  }
                  sx={{ mr: 0 }}
                />
              </Box>
            )}

          <div className={styles['container']}>
            <div>
              {/* Show update status when editing template */}
              {isEditingTemplate && templateTab === 'details' && objId && (
                <div style={{ marginBottom: '8px' }}>
                  {isUpdateTemplateSuccess && (
                    <Typography
                      variant="body2"
                      sx={{ color: 'success.main', mb: 1 }}
                    >
                      Template updated successfully!
                    </Typography>
                  )}
                  {isUpdateTemplateError && updateTemplateError && (
                    <Typography
                      variant="body2"
                      sx={{ color: 'error.main', mb: 1 }}
                    >
                      Error updating template: {updateTemplateError.message}
                    </Typography>
                  )}
                </div>
              )}

              {/* Render template info box for details and detailsTag tabs */}
              {(templateTab === 'details' || templateTab === 'detailsTag') &&
                objId !== undefined &&
                renderTemplateInfoBox()}

              {/* Render permissions chips when perms tab is active */}
              {templateTab === 'perms' && objId !== undefined && (
                <Box sx={{ px: 1, py: 1, mb: 1 }}>
                  {isFetchingPerms ? (
                    <Typography variant="body2" color="text.secondary">
                      Loading permissions...
                    </Typography>
                  ) : errorPerms ? (
                    <Typography variant="body2" color="error">
                      Error loading permissions: {errorPerms.message}
                    </Typography>
                  ) : templatePerms && typeof templatePerms === 'object' ? (
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1,
                        alignItems: 'center',
                      }}
                    >
                      {(() => {
                        const permsData =
                          templatePerms.permissions ?? templatePerms;
                        const entries: [string, string][] = Array.isArray(
                          permsData
                        )
                          ? permsData.map((entry: string) => {
                              const parts = entry.split(':');
                              return [parts[0], parts.slice(1).join(':')] as [
                                string,
                                string
                              ];
                            })
                          : Object.entries(permsData);
                        if (entries.length === 0) {
                          return (
                            <Typography variant="body2" color="text.secondary">
                              No permissions set
                            </Typography>
                          );
                        }
                        return entries.map(([user, level]) => (
                          <Chip
                            key={user}
                            label={`${user}:${level}`}
                            size="small"
                            variant="outlined"
                            onDelete={() => handleDeletePermission(user)}
                            disabled={isDeletingPermission}
                            sx={{
                              fontFamily: 'monospace',
                              fontSize: '0.8rem',
                              borderRadius: 1,
                              ...(level === 'ADMIN' || level === 'APPROVEDADMIN'
                                ? {
                                    borderColor: '#9c27b0',
                                    color: '#9c27b0',
                                    '& .MuiChip-deleteIcon': {
                                      color: '#9c27b0',
                                    },
                                  }
                                : level === 'USER'
                                ? {
                                    borderColor: '#9e9e9e',
                                    color: '#9e9e9e',
                                    '& .MuiChip-deleteIcon': {
                                      color: '#9e9e9e',
                                    },
                                  }
                                : {}),
                            }}
                          />
                        ));
                      })()}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No permissions data available
                    </Typography>
                  )}
                </Box>
              )}

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
                    editable={isEditingTemplate && templateTab === 'details'}
                    onChange={
                      isEditingTemplate && templateTab === 'details'
                        ? handleEditTemplateJsonChange
                        : undefined
                    }
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

        {/* Delete Template Tag Modal */}
        {deleteTagModalOpen && deleteTagInfo && (
          <DeleteTemplateTagModal
            toggle={() => {
              setDeleteTagModalOpen(false);
              setDeleteTagInfo(null);
            }}
            templateId={deleteTagInfo.templateId}
            tagTimestamp={deleteTagInfo.tagTimestamp}
            tagName={deleteTagInfo.tagName}
            dependentPods={deleteTagInfo.dependentPods}
          />
        )}

        {/* Delete Template Modal */}
        {deleteTemplateModalOpen && deleteTemplateInfo && (
          <DeleteTemplateModal
            toggle={() => {
              setDeleteTemplateModalOpen(false);
              setDeleteTemplateInfo(null);
            }}
            templateId={deleteTemplateInfo.templateId}
            dependentPods={deleteTemplateInfo.dependentPods}
            dependentTags={deleteTemplateInfo.dependentTags}
          />
        )}

        {/* Template Permission Modal */}
        {modal === 'templatePermissions' && objId && (
          <TemplatePermissionModal toggle={toggle} templateId={objId} />
        )}
      </div>
    </div>
  );
};

export default PageTemplates;
