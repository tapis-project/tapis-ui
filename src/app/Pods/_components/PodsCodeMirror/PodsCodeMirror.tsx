import React, { useState, ReactNode } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { SubmitWrapper } from '@tapis/tapisui-common';
import { json } from '@codemirror/lang-json';
import { vscodeDarkInit } from '@uiw/codemirror-theme-vscode';
import styles from '../Pages.module.scss'; // Adjust the import path as necessary
import { Box } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { EditorView } from '@codemirror/view';

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
  editPanel?: ReactNode;
}

const PodsCodeMirror: React.FC<PodsCodeMirrorProps> = ({
  value,
  editValue,
  height = '800px', // Default height
  width = '100%', // Default width
  isVisible,
  editable = false,
  onChange,
  isEditorVisible = false,
  editPanel,
}) => {
  if (!isVisible) {
    return null;
  }

  // <Box display={'flex'} flexDirection={'row'}>

  // <Grid
  //   container
  //   flexDirection={'column'}
  //   minWidth={'20rem'}
  //   flexGrow={1}
  //   rowSpacing={0.4}

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', flexGrow: 1 }}>
      {isEditorVisible && (
        <Grid
          sx={{
            flexShrink: 1,
            padding: '16px',
            minWidth: '28rem',
            width: '28rem',
            height: '46rem',
            border: '1px solid rgba(112, 112, 112, 0.25)',
            marginRight: '.8em',
            overflow: 'auto',
          }}
        >
          {editPanel}
        </Grid>
      )}
      <Grid
        container
        // flexDirection="column"
        // height="40rem"
        flexWrap={'nowrap'}
        height="46rem"
        rowSpacing={0.4}
        // height="44rem" (this causes side by side)
        overflow="scroll"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minWidth: '20rem',
          flexGrow: 1,
        }}
      >
        <Grid>
          {isEditorVisible && editValue && (
            <CodeMirror
              value={editValue}
              editable={editable}
              readOnly={!editable}
              extensions={[json(), EditorView.lineWrapping]}
              //height="16rem" // Keep this for correct height horizontal scroll
              minHeight="1rem"
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
          )}
        </Grid>

        <Grid>
          <CodeMirror
            value={value}
            editable={false}
            readOnly={true}
            extensions={[json(), EditorView.lineWrapping]}
            // height = "22rem"
            height="46rem" // Keep this for correct height horizontal scroll
            // height="100%"
            minHeight="22rem"
            // maxWidth='20rem'
            //height="100%"
            maxHeight="calc(100vh - 170px)"
            width="100%"
            theme={vscodeDarkInit({
              settings: {
                caret: '#c6c6c6',
                fontFamily: 'monospace',
              },
            })}
            style={{
              // Values in CodeMirror change based on content.
              width: '100%',
              height: '100%',
              //height: 'calc(100vh - 170px)',
              fontSize: 12,
              backgroundColor: '#f5f5f5',
              fontFamily:
                'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
            }}
          />
        </Grid>
      </Grid>
      {/* </Grid> */}
    </Box>
  );
};

export default PodsCodeMirror;
