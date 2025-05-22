import React, { PropsWithChildren, useEffect, useState } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { Alert, AlertTitle, Button } from '@mui/material';

type Action<T> = {
  name: string;
  color?: 'error' | 'info';
  allowParseError?: boolean;
  allowUndefinedValue?: boolean;
  fn: (obj: T | undefined) => void;
};

type JSONEditorProps<T = any> = {
  obj?: T | undefined;
  actions?: Array<Action<T>>;
  style?: React.CSSProperties;
};

const JSONEditor = <T,>({
  obj = undefined,
  actions = [],
  style = {},
}: PropsWithChildren<JSONEditorProps<T>>): React.ReactElement => {
  const [value, setValue] = useState<T | undefined>(undefined);
  const [parseError, setParseError] = useState<Error | undefined>(undefined);
  useEffect(() => {
    setValue(obj);
  }, [obj]);

  return (
    <div>
      {parseError && (
        <Alert severity="error">
          <AlertTitle>JSON Error</AlertTitle>
          {parseError.message}
        </Alert>
      )}
      <CodeEditor
        value={JSON.stringify(obj, null, 2)}
        language={'json'}
        placeholder={`Please enter valid json`}
        onChange={(e) => {
          if (e.target.value === '') {
            setValue(undefined);
            setParseError(undefined);
            return;
          }

          try {
            let json = JSON.parse(e.target.value) as T;
            setValue(json);
            setParseError(undefined);
          } catch (e) {
            setParseError(e as Error);
          }
        }}
        padding={16}
        color="black"
        style={{
          fontSize: 16,
          lineHeight: 1.5,
          backgroundColor: '#f5f5f5',
          color: 'black',
          fontFamily:
            'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
          ...style,
        }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'right',
          gap: '8px',
          marginTop: '8px',
        }}
      >
        {actions.map((action) => {
          return (
            <Button
              variant="outlined"
              color={action.color === undefined ? 'info' : action.color}
              size="small"
              disabled={
                (value === undefined && !action.allowUndefinedValue) ||
                (parseError !== undefined && !action.allowParseError)
              }
              onClick={() => {
                action.fn(value);
              }}
            >
              {action.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default JSONEditor;
