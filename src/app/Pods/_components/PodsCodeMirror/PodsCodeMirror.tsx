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
        overflow: 'visible',
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
      <Grid
        container
        flexWrap={'nowrap'}
        rowSpacing={0.4}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minWidth: '20rem',
          flexGrow: 1,
          overflow: 'visible',
        }}
      >
        <CodeMirror
          value={value}
          editable={editable}
          readOnly={!editable}
          onChange={onChange}
          extensions={[json(), EditorView.lineWrapping]}
          minHeight="46rem"
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
          ref={(view) => {
            if (view) {
              editorRef.current = view.view ?? null;
            }
          }}
        />
      </Grid>
    </Box>
  );
};

export default PodsCodeMirror;
