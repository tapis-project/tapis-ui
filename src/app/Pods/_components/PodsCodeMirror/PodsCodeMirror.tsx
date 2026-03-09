import React, { useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { vscodeDarkInit } from '@uiw/codemirror-theme-vscode';
import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
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
  editPanel?: React.ReactNode;
  scrollToBottom?: boolean;
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
  scrollToBottom = false,
}) => {
  const editorRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (scrollToBottom && editorRef.current) {
      const view = editorRef.current;
      view.dispatch({
        effects: EditorView.scrollIntoView(view.state.doc.length, { y: 'end' }),
      });
    }
  }, [value, scrollToBottom]);

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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flexGrow: 1,
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      {isEditorVisible && (
        <Grid
          sx={{
            flexShrink: 1,
            padding: '8px',
            minWidth: '28rem',
            width: '28rem',
            height: '100%',
            border: '1px solid rgba(112, 112, 112, 0.25)',
            marginRight: '.8em',
            overflow: 'auto',
          }}
        >
          {editPanel}
        </Grid>
      )}
      <div
        style={{
          position: 'relative',
          flex: 1,
          minHeight: 0,
          minWidth: '20rem',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <CodeMirror
            value={value}
            editable={editable}
            readOnly={!editable}
            onChange={onChange}
            extensions={[json(), EditorView.lineWrapping]}
            height="100%"
            width="100%"
            theme={vscodeDarkInit({
              settings: {
                caret: '#c6c6c6',
                fontFamily: 'monospace',
              },
            })}
            style={{
              width: '100%',
              height: '100%',
              fontSize: 12,
              backgroundColor: '#f5f5f5',
              fontFamily:
                'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
            }}
            ref={(view) => {
              if (view) {
                editorRef.current = view.view ?? null;
              }
            }}
          />
        </div>
      </div>
    </Box>
  );
};

export default PodsCodeMirror;
