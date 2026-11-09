/**
 * Read-only JSON viewer for the sidebar's token dialogs.
 *
 * Split out of Sidebar.tsx purely to move CodeMirror off the cold-start path.
 * The sidebar is mounted for every signed-in user on every page, so a static
 * `import CodeMirror from '@uiw/react-codemirror'` there put the whole editor
 * bundle — 161 KB gzipped — in the eager chunk, downloaded and executed by
 * everyone whether or not they ever opened the dialog it is used in.
 *
 * Rendering is byte-for-byte what Sidebar.tsx did before; only where the code
 * is loaded from changed. Import this through JsonViewerLazy, never directly.
 */
import React from 'react';
import { EditorView } from 'codemirror';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { vscodeDarkInit } from '@uiw/codemirror-theme-vscode';

const JsonViewer: React.FC<{ value: string }> = ({ value }) => (
  <CodeMirror
    value={value}
    editable={false}
    readOnly={true}
    basicSetup={{
      lineNumbers: false,
      tabSize: 2,
      foldGutter: false,
    }}
    extensions={[EditorView.lineWrapping, json()]}
    theme={vscodeDarkInit({
      settings: {
        caret: '#c6c6c6',
        fontFamily: 'monospace',
      },
    })}
    style={{
      fontSize: 12,
      backgroundColor: '#f5f5f5',
      fontFamily:
        'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
    }}
  />
);

export default JsonViewer;
