import React, { PropsWithChildren } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { Button } from '@mui/material';

type Action<T> = {
  name: string;
  fn: (obj: T) => void;
};

type JSONEditorProps<T = any> = {
  obj?: T;
  actions?: Array<Action<T>>;
};

const JSONEditor: React.FC<PropsWithChildren<JSONEditorProps>> = ({
  obj = undefined,
  actions = [],
}) => {
  return (
    <div
      style={{
        padding: '8px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '8px',
          marginBottom: '8px',
        }}
      >
        {actions.map((action) => {
          return (
            <Button variant="outlined" color="info" onClick={action.fn}>
              {action.name}
            </Button>
          );
        })}
      </div>
      <CodeEditor
        value={JSON.stringify(obj, null, 2)}
        language={'json'}
        placeholder={`Please enter valid json`}
        onChange={() => {}}
        padding={16}
        color="black"
        style={{
          fontSize: 16,
          backgroundColor: '#f5f5f5',
          color: 'black',
          fontFamily:
            'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
        }}
      />
    </div>
  );
};

export default JSONEditor;
