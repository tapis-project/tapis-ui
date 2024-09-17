import React, { useState } from 'react';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import styles from './CreateSecretModal.module.scss';
import { LoadingButton as Button } from '@mui/lab';
import {
  FormControl,
  InputLabel,
  FormHelperText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  AlertTitle,
  Input,
} from '@mui/material';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';

type CreateSecretModalProps = {
  open: boolean;
  toggle: () => void;
};

type InputState = {
  id: string | undefined;
  description: string | undefined;
  data: object | undefined;
};

const CreateSecretModal: React.FC<CreateSecretModalProps> = ({
  open,
  toggle,
}) => {
  const initialInput: InputState = {
    id: undefined,
    data: undefined,
    description: undefined,
  };
  const [input, setInput] = useState(initialInput);
  const { create, isLoading, isError, error, isSuccess, invalidate, reset } =
    Hooks.Secrets.useCreate();

  return (
    <Dialog
      open={open}
      onClose={() => {}}
      aria-labelledby="Create secret modal"
      aria-describedby="A modal for creating a secret"
      maxWidth="sm"
      fullWidth={true}
    >
      <DialogTitle id="alert-dialog-title">Create Secret</DialogTitle>
      <DialogContent>
        {isSuccess && (
          <Alert severity="success" style={{ marginTop: '8px' }}>
            Successfully created secret
          </Alert>
        )}
        {isError && error && (
          <Alert
            severity="error"
            style={{ marginTop: '8px' }}
            onClose={() => {
              reset();
            }}
          >
            <AlertTitle>Error</AlertTitle>
            {error.message}
          </Alert>
        )}
        <div className={styles['form']}>
          <FormControl variant="standard">
            <InputLabel htmlFor="secret-id">Secret id</InputLabel>
            <Input
              id="secret-id"
              onChange={(e) => {
                setInput({ ...input, id: e.target.value });
              }}
            />
            <FormHelperText>
              The unique identifier for this secret. May contain only
              alphanumeric characters, underlines, and hyphens
            </FormHelperText>
          </FormControl>
        </div>
        <div className={styles['form']}>
          <FormControl variant="standard">
            <InputLabel htmlFor="description">Description</InputLabel>
            <Input
              id="description"
              onChange={(e) => {
                setInput({ ...input, description: e.target.value });
              }}
            />
            <FormHelperText>A description of the secret</FormHelperText>
          </FormControl>
        </div>
        <div className={styles['form']}>
          <FormControl variant="standard">
            <InputLabel htmlFor="data">Data</InputLabel>
            <CodeMirror
              theme="light"
              height="200px"
              extensions={[json()]}
              onChange={(value: any) => {
                setInput({ ...input, data: value as object });
              }}
            />
            <FormHelperText>
              The secret data. Must be a string, number, boolean, or valid JSON
              object
            </FormHelperText>
          </FormControl>
        </div>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setInput(initialInput);
            reset();
            toggle();
          }}
        >
          {isSuccess ? 'Continue' : 'Cancel'}
        </Button>
        <Button
          onClick={() => {
            create(
              {
                id: input.id!,
                description: input.description,
                data: input.data,
              },
              {
                onSuccess: () => {
                  setInput(initialInput);
                  invalidate();
                },
              }
            );
          }}
          disabled={
            isSuccess || input.id === undefined || input.data === undefined
          }
          loading={isLoading}
          variant="outlined"
          autoFocus
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateSecretModal;
