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
import { LoadingButton } from '@mui/lab';
import { RefreshRounded } from '@mui/icons-material';
import { SectionMessage } from '@tapis/tapisui-common';

import { NavImages } from 'app/Pods/_components';
import PodToolbar from 'app/Pods/_components/PodToolbar';

import { ImageWizard } from '../';
// import { DeleteImageModal } from '../Modals';
import { useHistory } from 'react-router-dom';
import { NavPods, PodsCodeMirror, PodsNavigation } from 'app/Pods/_components';
import PodsLoadingText from '../PodsLoadingText';
import { NavLink } from 'react-router-dom';

import { useAppSelector, updateState, useAppDispatch } from '@redux';

const PageImages: React.FC<{ objId: string | undefined }> = ({ objId }) => {
  const dispatch = useAppDispatch();
  const { imageTab, imageRootTab } = useAppSelector((state) => state.pods);
  const { data, isLoading, isFetching, error, invalidate } = Hooks.useGetImage(
    { imageId: objId },
    { enabled: !!objId }
  );
  const tooltipText =
    'Pods saves pod interactions in an Action Logs ledger. User and system interaction with your pod is logged here.';
  const pod: any | undefined = data?.result;

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
  };

  const renderTooltipModal = () => {
    const config =
      tooltipConfigs[(objId === undefined ? imageRootTab : imageTab) ?? ''];
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

  const [sharedData, setSharedData] = useState({});

  const getCodeMirrorValue = () => {
    if (objId === undefined) {
      switch (imageRootTab) {
        case 'dashboard':
          return `Images:
You can view the images that are available to use here.
Images are added by administrators after initial vetting.
Please reach out to your administrator if you need a new image added.

Images here work, but might not be up-to-date, safe, reviewed, secure, or thought out at all.
Please take caution running docker images you're unaware of. 
Always check the Dockerfile and the image source before using something.
Images match the registry name, with a default registry of Docker Hub.

Select an image to get started.`;

        case 'createImage':
          return JSON.stringify(
            'Ability to add images is limited to admins',
            null,
            2
          );
        default:
          return ''; // Default or placeholder value
      }
    } else {
      switch (imageTab) {
        case 'details':
          return error
            ? `error: ${error}`
            : isFetching
            ? loadingText
            : JSON.stringify(pod, null, 2);
        case 'edit':
          return error
            ? `error: ${error}`
            : isFetching
            ? loadingText
            : JSON.stringify(
                'Ability to edit description/tenants not yet implemented',
                null,
                2
              );
        default:
          return ''; // Default or placeholder value
      }
    }
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
    {
      id: 'refresh',
      label: 'Refresh',
      icon: <RefreshRounded sx={{ height: '20px', maxWidth: '20px' }} />,
      customOnClick: () => {
        invalidate();
      },
    },
    { id: 'details', label: 'Details', tabValue: 'details' },
    { id: 'edit', label: 'Edit', tabValue: 'edit' },
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
          id: 'createImage',
          label: 'Create Image',
          tabValue: 'createImage',
        },
      ];
    }
    return leftButtons;
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
              loading={id === 'refresh' && isFetching}
              key={id}
              variant="outlined"
              disabled={disabled}
              color={
                imageTab === tabValue || imageRootTab === tabValue
                  ? 'secondary'
                  : 'primary'
              }
              size="small"
              onClick={() => {
                if (customOnClick) {
                  customOnClick();
                } else if (tabValue) {
                  if (objId === undefined) {
                    dispatch(updateState({ imageRootTab: tabValue }));
                  } else {
                    dispatch(updateState({ imageTab: tabValue }));
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
              imageTab === tabValue || imageRootTab === tabValue
                ? 'secondary'
                : 'primary'
            }
            size="small"
            onClick={() => {
              if (customOnClick) {
                customOnClick();
              } else if (tabValue) {
                if (objId === undefined) {
                  dispatch(updateState({ imageRootTab: tabValue }));
                } else {
                  dispatch(updateState({ imageTab: tabValue }));
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
        <PodsNavigation from="images" id={objId} />

        <Stack spacing={2} direction="row">
          <NavLink
            to="/pods/images"
            className={styles['nav-link']}
            activeClassName={styles['active']}
            onClick={() =>
              dispatch(updateState({ imageRootTab: 'createImage' }))
            }
          >
            <Button
              disabled={false}
              variant="outlined"
              size="small"
              aria-label="createImage"
              className={styles['toolbar-btn']}
            >
              Create
            </Button>
          </NavLink>

          {/* <Button
            disabled={false}
            variant="outlined"
            size="small"
            onClick={() => setModal('deleteImage')}
            aria-label="deleteImage"
            className={styles['toolbar-btn']}
          >
            Delete
          </Button> */}
        </Stack>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', overflow: 'auto' }}>
        <div style={{}} className={` ${styles['nav']} `}>
          <NavImages />
        </div>
        <div
          style={{
            margin: '1rem',
            flex: 1,
            overflow: 'auto',
          }}
        >
          {renderTabBar(getTabBarButtons(), rightButtons)}
          <div className={styles['container']}>
            <PodsCodeMirror
              editValue={
                imageTab === 'edit' ? JSON.stringify(sharedData, null, 2) : ''
              }
              value={codeMirrorValue?.toString() ?? ''}
              isVisible={true}
              isEditorVisible={
                (imageTab === 'edit' && objId !== undefined) ||
                (imageRootTab === 'createImage' && objId === undefined)
              }
              //   <ImageWizardEdit
              //   sharedData={sharedData}
              //   setSharedData={setSharedData}
              // />

              editPanel={
                imageTab === 'edit' && objId !== undefined ? (
                  <div />
                ) : (
                  <ImageWizard
                    sharedData={sharedData}
                    setSharedData={setSharedData}
                  />
                )
              }
            />
          </div>
        </div>
        <div>{renderTooltipModal()}</div>
        {/* {modal === 'deleteImage' && <DeleteImageModal toggle={toggle} />} */}
      </div>
    </div>
  );
};

export default PageImages;
