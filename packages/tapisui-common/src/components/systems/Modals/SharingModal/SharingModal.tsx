import React, { useState } from 'react';
import { Systems as SystemsHooks } from '@tapis/tapisui-hooks';
import { Systems } from '@tapis/tapis-typescript';
import { LoadingButton as Button } from '@mui/lab';
import styles from './SharingModal.module.scss';
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

type ModalProps = {
  open: boolean;
  toggle: () => void;
  systemId: string;
};

const SharingModal: React.FC<ModalProps> = ({ open, toggle, systemId }) => {
  const { share, isLoading, isError, isSuccess, error, reset, invalidate } =
    SystemsHooks.useShareSystem();
  const [username, setUsername] = useState<string | undefined>();

  return (
    <Dialog
      open={open}
      onClose={() => {
        toggle();
      }}
      aria-labelledby="Share system"
      aria-describedby="A modals sharing a system with a user"
      maxWidth="sm"
      fullWidth={true}
    >
      <DialogTitle id="alert-dialog-title">Share system</DialogTitle>
      <DialogContent>
        {isSuccess && (
          <Alert severity="success" style={{ marginTop: '8px' }}>
            Successfully shared system
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
        <div className={styles['form']}>
          <FormControl variant="standard">
            <InputLabel htmlFor="username">Username</InputLabel>
            <Input
              id="username"
              onChange={(e) => {
                setUsername(e.target.value);
              }}
            />
            <FormHelperText>
              The username of the user you want to share the system with
            </FormHelperText>
          </FormControl>
        </div>
      </DialogContent>
      <DialogActions>
        <Button
          color={isSuccess ? 'primary' : 'error'}
          onClick={() => {
            reset();
            setUsername(undefined);
            toggle();
          }}
        >
          {isSuccess ? 'Continue' : 'Cancel'}
        </Button>
        <Button
          disabled={username === undefined}
          onClick={() => {
            share(
              {
                systemId,
                reqShareUpdate: {
                  users: [username!],
                },
              },
              {
                onSuccess: () => {
                  invalidate();
                },
              }
            );
          }}
          loading={isLoading}
          variant="outlined"
          autoFocus
        >
          Share
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SharingModal;
