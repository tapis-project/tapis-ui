import React, { PropsWithChildren, useEffect, useState } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { Alert, AlertTitle } from '@mui/material';
import { LoadingButton } from '@mui/lab';

type ActionValidationResult = {
  success: boolean;
  message?: string | undefined;
};

type Action<T> = {
  name: string;
  color?: 'error' | 'info';
  disableOnError?: boolean;
  disableOnUndefined?: boolean;
  disableOnSuccess?: boolean;
  disableOnIsLoading?: boolean;
  actionFn: (obj: T | undefined) => void;
  validator?: (obj: T | undefined) => ActionValidationResult;
  isLoading?: boolean;
  isSuccess?: boolean;
  error?: ActionError;
};

export type ActionError = {
  title?: string;
  message: string;
};

type JSONEditorProps<T = any> = {
  obj?: T | undefined;
  actions?: Array<Action<T>>;
  style?: React.CSSProperties;
  onCloseError?: () => void;
  renderNewlinesInError?: boolean;
};

const JSONEditor = <T,>({
  obj = undefined,
  actions = [],
  style = {},
  onCloseError = () => {},
  renderNewlinesInError = false,
}: PropsWithChildren<JSONEditorProps<T>>): React.ReactElement => {
  const [lines, setLines] = useState(0);
  const [value, setValue] = useState<T | undefined>(undefined);
  const [error, setError] = useState<ActionError | undefined>(undefined);

  useEffect(() => {
    try {
      let objString = JSON.stringify(obj, null, 2);
      setLines(objString.split('\n').length);
    } catch (e) {
      setError({
        title: 'ParseError',
        message: (e as Error).message,
      });
    }
    setValue(obj);
  }, [obj]);

  return (
    <div>
      {error && (
        <Alert
          style={{
            maxWidth: '600px',
          }}
          severity="error"
          onClose={() => {
            onCloseError();
            setError(undefined);
          }}
        >
          <AlertTitle>{error.title ? error.title : 'Error'}</AlertTitle>
          {renderNewlinesInError
            ? error.message.split('\n').map((msg) => {
                return (
                  <span>
                    {msg}
                    <br />
                  </span>
                );
              })
            : error.message}
        </Alert>
      )}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          fontFamily: 'monospace',
        }}
      >
        {lines > 0 && (
          <div
            style={{
              paddingTop: '24px',
              paddingRight: '4px',
              display: 'flex',
              flexDirection: 'column',
              fontSize: '16px',
              lineHeight: '1.5',
              userSelect: 'none',
            }}
          >
            {[...Array(lines).keys()].map((num) => (
              <div
                style={{
                  minWidth: '24px',
                  paddingRight: '4px',
                  paddingLeft: '4px',
                  textAlign: 'right',
                  backgroundColor: num % 2 == 0 ? 'lightgray' : '#f5f5f5',
                }}
              >
                {num + 1}
              </div>
            ))}
          </div>
        )}
        <CodeEditor
          value={JSON.stringify(obj, null, 2)}
          language={'json'}
          placeholder={`Please enter valid json`}
          onChange={(e) => {
            setLines(e.target.value.split('\n').length);
            if (e.target.value === '') {
              setValue(undefined);
              setError(undefined);
              return;
            }

            try {
              let json = JSON.parse(e.target.value) as T;
              setValue(json);
              setError(undefined);
            } catch (e) {
              setError({
                title: 'ParseError',
                message: (e as Error).message,
              });
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
      </div>
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
          if (action.error !== undefined && error === undefined) {
            setError(action.error);
          }
          return (
            <LoadingButton
              variant="outlined"
              color={action.color === undefined ? 'info' : action.color}
              size="small"
              disabled={
                (value === undefined && action.disableOnUndefined) ||
                (error !== undefined && action.disableOnError) ||
                (action.isLoading && action.disableOnIsLoading) ||
                (action.isSuccess && action.disableOnSuccess)
              }
              loading={action.isLoading ? action.isLoading : false}
              onClick={() => {
                let result = undefined;
                if (action.validator) {
                  result = action.validator(value);
                }

                if (result && !result.success) {
                  setError({
                    title: 'Validation Error',
                    message: result.message ? result.message : '',
                  });
                  return;
                }
                action.actionFn(value);
              }}
            >
              {action.name}
            </LoadingButton>
          );
        })}
      </div>
    </div>
  );
};

export default JSONEditor;
