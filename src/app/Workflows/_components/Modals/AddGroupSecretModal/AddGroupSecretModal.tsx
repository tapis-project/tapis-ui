import React, { useState } from 'react';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import styles from './AddGroupSecretModal.module.scss';
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
  Select,
  MenuItem,
} from '@mui/material';

type CreateSecretModalProps = {
  groupId: string;
  open: boolean;
  toggle: () => void;
};

type InputState = {
  groupSecretId: string | undefined;
  secretId: string | undefined;
};

const AddGroupSecretModal: React.FC<CreateSecretModalProps> = ({
  open,
  toggle,
  groupId,
}) => {
  const initialInput: InputState = {
    groupSecretId: undefined,
    secretId: undefined,
  };
  const [input, setInput] = useState(initialInput);
  const { create, isLoading, isError, error, isSuccess, invalidate, reset } =
    Hooks.GroupSecrets.useCreate();
  const { data, isLoading: isLoadingSecrets } = Hooks.Secrets.useList();
  const secrets = data?.result || [];

  return (
    <Dialog
      open={open}
      onClose={() => {}}
      aria-labelledby="Create group secret modal"
      aria-describedby="A modal for creating a group secret"
      maxWidth="sm"
      fullWidth={true}
    >
      <DialogTitle id="alert-dialog-title">Create Group Secret</DialogTitle>
      <DialogContent>
        {isSuccess && (
          <Alert severity="success" style={{ marginTop: '8px' }}>
            Successfully created group secret
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
            <InputLabel htmlFor="group-secret-id">Group secret id</InputLabel>
            <Input
              id="group-secret-id"
              onChange={(e) => {
                setInput({ ...input, groupSecretId: e.target.value });
              }}
            />
            <FormHelperText>
              The unique identifier for this group secret. May contain only
              alphanumeric characters, underlines, and hyphens
            </FormHelperText>
          </FormControl>
        </div>
        <div className={styles['form']}>
          <FormControl variant="standard">
            <InputLabel htmlFor="secret-id">Secret id</InputLabel>
            <Select type="select" size="small" defaultValue="">
              <MenuItem disabled value="">
                -- Choose a repository --
              </MenuItem>
              {secrets.map((secret) => {
                return (
                  <MenuItem
                    value={secret.id}
                    onClick={() => {
                      setInput({
                        ...input,
                        secretId: secret.id,
                      });
                    }}
                  >
                    {secret.id}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <FormHelperText>
            The secret to use for this group secret
          </FormHelperText>
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
                groupId,
                reqGroupSecret: {
                  id: input.groupSecretId!,
                  secret_id: input.secretId!,
                },
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
            isSuccess ||
            input.secretId === undefined ||
            input.groupSecretId === undefined
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

export default AddGroupSecretModal;
