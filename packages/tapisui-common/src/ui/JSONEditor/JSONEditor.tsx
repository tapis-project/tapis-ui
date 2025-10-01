import React, { PropsWithChildren, useEffect, useState } from 'react';
import { Alert, AlertTitle } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';

type ActionValidationResult = {
  success: boolean;
  message?: string | undefined;
};

export type ActionError = {
  title?: string;
  message: string;
};

type ActionResult = {
  success: boolean;
  message?: string | undefined;
  error?: ActionError;
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
  result?: ActionResult;
};

type JSONEditorProps<T = any> = {
  obj?: T | undefined;
  actions?: Array<Action<T>>;
  style?: React.CSSProperties;
  onCloseError?: () => void;
  onCloseSuccess?: () => void;
  renderNewlinesInError?: boolean;
};

const JSONEditor = <T,>({
  obj = undefined,
  actions = [],
  style = {},
  onCloseError = () => {},
  onCloseSuccess = () => {},
  renderNewlinesInError = false,
}: PropsWithChildren<JSONEditorProps<T>>): React.ReactElement => {
  const [value, setValue] = useState<T | undefined>(undefined);
  const [error, setError] = useState<ActionError | undefined>(undefined);
  const [result, setResult] = useState<ActionResult | undefined>(undefined);

  useEffect(() => {
    if (value === undefined) {
      setValue(obj);
    }
  }, []);

  useEffect(() => {
    try {
      let objString = JSON.stringify(obj, null, 2);
    } catch (e) {
      setError({
        title: 'ParseError',
        message: (e as Error).message,
      });
    }

    // setValue(obj);
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
            setValue(value);
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
      {result && (
        <Alert
          style={{
            maxWidth: '600px',
          }}
          severity="success"
          onClose={() => {
            onCloseSuccess();
            setResult(undefined);
          }}
        >
          {result.message}
        </Alert>
      )}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          fontFamily: 'monospace',
        }}
      >
        <CodeMirror
          value={JSON.stringify(obj, null, 2)}
          editable
          extensions={[json()]}
          theme={vscodeDark}
          placeholder={`Please enter valid json`}
          onChange={(value) => {
            if (value === '') {
              setValue(undefined);
              setError(undefined);
              return;
            }

            try {
              let json = JSON.parse(value) as T;
              setValue(json);
              setError(undefined);
            } catch (e) {
              setError({
                title: 'ParseError',
                message: (e as Error).message,
              });
            }
          }}
          color="black"
          style={{
            overflow: 'auto',
            whiteSpace: 'pre',
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

          if (action.result !== undefined && result == undefined) {
            setResult(action.result);
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
                let validation = undefined;
                if (action.validator) {
                  validation = action.validator(value);
                }

                if (validation && !validation.success) {
                  setError({
                    title: 'Validation Error',
                    message: validation.message ? validation.message : '',
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
