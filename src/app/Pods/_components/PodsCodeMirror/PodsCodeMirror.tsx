import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { SubmitWrapper } from '@tapis/tapisui-common';

import { json } from '@codemirror/lang-json';
import { vscodeDarkInit } from '@uiw/codemirror-theme-vscode';
import styles from '../Pages.module.scss'; // Adjust the import path as necessary
import { UpdatePodBase } from '../PodToolbar/CreatePodModal';
import { Button } from 'reactstrap';

interface PodsCodeMirrorProps {
  value: string;
  editValue?: string;
  height?: string;
  width?: string;
  minWidth?: string;
  isVisible: boolean;
  editable?: boolean;
  onChange?: (newValue: string) => void;
  isEditorVisible?: boolean;
  sharedData: any;
  setSharedData: any;
}

const PodsCodeMirror: React.FC<PodsCodeMirrorProps> = ({
  value,
  editValue = '',
  height = '800px', // Default height
  width = '100%', // Default width
  isVisible,
  editable = false,
  onChange,
  isEditorVisible = false,
  sharedData,
  setSharedData,
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      {isEditorVisible && (
        <div
          style={{
            flexShrink: 1,
            padding: '16px',
            width: '30rem',
            height: '46rem',
            border: '1px solid rgba(112, 112, 112, 0.25)',
            marginRight: '.8em',
            overflow: 'auto',
          }}
        >
          <UpdatePodBase
            sharedData={sharedData}
            setSharedData={setSharedData}
          />
        </div>
      )}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flex: 1,
          flexBasis: 1,
          flexShrink: 0,
          flexGrow: 2,
          overflow: 'auto',
        }}
      >
        <CodeMirror
          value={value}
          editable={editable}
          readOnly={!editable}
          extensions={[json()]}
          height="100%" // Keep this for correct height horizontal scroll
          minHeight="46rem"
          maxHeight="calc(100vh - 170px)"
          minWidth="28rem"
          theme={vscodeDarkInit({
            settings: {
              caret: '#c6c6c6',
              fontFamily: 'monospace',
            },
          })}
          style={{
            // Values in CodeMirror change based on content.
            width: '100%',
            //height: 'calc(100vh - 170px)',
            fontSize: 12,
            backgroundColor: '#f5f5f5',
            fontFamily:
              'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
          }}
        />
      </div>
    </div>
  );
};

export default PodsCodeMirror;
