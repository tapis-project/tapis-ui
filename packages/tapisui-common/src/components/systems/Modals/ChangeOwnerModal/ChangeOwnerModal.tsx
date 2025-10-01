import React, { useState } from 'react';
import { Systems as SystemsHooks } from '@tapis/tapisui-hooks';
import { Systems } from '@tapis/tapis-typescript';
import { LoadingButton as Button } from '@mui/lab';
import styles from './ChangeOwnerModal.module.scss';
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
  Chip,
} from '@mui/material';
import { Security } from '@mui/icons-material';

type ModalProps = {
  open: boolean;
  toggle: () => void;
  system: Systems.TapisSystem;
};

const ChangeOwnerModal: React.FC<ModalProps> = ({ open, toggle, system }) => {
  const { change, isLoading, isError, isSuccess, error, reset, invalidate } =
    SystemsHooks.useChangeOwner();
  const inputInitialState: { username?: string; perms: string[] } = {
    username: undefined,
    perms: [],
  };
  const [input, setInput] = useState(inputInitialState);

  return (
    <Dialog
      open={open}
      onClose={() => {
        toggle();
      }}
      aria-labelledby="Change Owners for a system"
      aria-describedby="A modal for managing owner change for a system"
      maxWidth="sm"
      fullWidth={true}
    >
      <DialogTitle id="alert-dialog-title">
        <Security style={{ marginTop: '-5px' }} />
        <span style={{ marginLeft: '8px' }}>Change Owners</span>
      </DialogTitle>
      <DialogContent>
        {isSuccess && (
          <Alert severity="success" style={{ marginTop: '8px' }}>
            Owners Changed
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
            {error && error.message}
          </Alert>
        )}
        {system.sharedWithUsers!.length === 0 || system.isPublic ? (
          <div className={styles['form']}>
            <FormControl variant="standard">
              <InputLabel htmlFor="username">Username</InputLabel>
              <Input
                id="username"
                disabled={isSuccess}
                onChange={(e) => {
                  setInput({
                    ...input,
                    username: e.target.value,
                  });
                }}
              />
              <FormHelperText>
                The username of the user for whom you want to give ownership
              </FormHelperText>
            </FormControl>
          </div>
        ) : (
          <div className={styles['form']}>
            <FormControl
              fullWidth
              margin="dense"
              style={{ marginBottom: '-16px' }}
            >
              <InputLabel size="small" id="mode">
                Username
              </InputLabel>
              <Select
                label="Task invocation mode"
                labelId="mode"
                size="small"
                disabled={isSuccess}
                onChange={(e) => {
                  setInput({
                    ...input,
                    username: e.target.value as string,
                  });
                }}
              >
                {system.sharedWithUsers!.map((username) => {
                  return <MenuItem value={username}>{username}</MenuItem>;
                })}
              </Select>
            </FormControl>
            <FormHelperText>
              The username of the user for whom you want to give ownership
            </FormHelperText>
          </div>
        )}
        {input.username && (
          <div className={styles['perms']}>
            {['Select'].map((perm) => {
              return (
                <Chip
                  label={perm}
                  color={input.perms.includes(perm) ? 'primary' : 'default'}
                  onClick={() => {
                    // Add perm to perms if not already included
                    const additionalPerms = perm === 'MODIFY' ? ['READ'] : [];
                    if (!input.perms.includes(perm)) {
                      setInput({
                        ...input,
                        perms: [...input.perms, perm, ...additionalPerms],
                      });
                      return;
                    }

                    // Remove perm because it is already selected
                    setInput({
                      ...input,
                      perms: input.perms.filter((p) => p !== perm),
                    });
                  }}
                />
              );
            })}
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          color={isSuccess ? 'primary' : 'error'}
          onClick={() => {
            reset();
            setInput(inputInitialState);
            toggle();
          }}
        >
          {isSuccess ? 'Continue' : 'Cancel'}
        </Button>
        <Button
          disabled={
            isSuccess ||
            input.username === undefined ||
            input.perms.length === 0
          }
          onClick={() => {
            change(
              {
                systemId: system.id!,
                userName: input.username!,
              },
              {
                onSuccess: () => {
                  invalidate();
                  setInput(inputInitialState);
                },
              }
            );
          }}
          loading={isLoading}
          variant="outlined"
          autoFocus
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangeOwnerModal;
