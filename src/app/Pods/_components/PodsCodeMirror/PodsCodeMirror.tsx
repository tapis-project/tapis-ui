import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { vscodeDarkInit } from '@uiw/codemirror-theme-vscode';
import styles from '../Pages.module.scss'; // Adjust the import path as necessary

interface PodsCodeMirrorProps {
  value: string;
  height?: string;
  width?: string;
  isVisible: boolean;
}

const PodsCodeMirror: React.FC<PodsCodeMirrorProps> = ({
  value,
  height = '800px', // Default height
  width = '100%', // Default width
  isVisible,
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div style={{ display: 'block' }} className={styles['container']}>
      <CodeMirror
        value={value}
        editable={false}
        readOnly={true}
        extensions={[json()]}
        height={height}
        width={width}
        minHeight="200px"
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
    </div>
  );
};

export default PodsCodeMirror;
