import React, { useState } from 'react';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import styles from './GlobusAuthModal.module.scss';
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
import { Login } from '@mui/icons-material';

type ModalProps = {
  open: boolean;
  toggle: () => void;
  systemId: string;
};

type InputState = {
  authCode: string | undefined;
};

const GlobusAuthModal: React.FC<ModalProps> = ({ open, toggle, systemId }) => {
  const initialInput: InputState = {
    authCode: undefined,
  };
  const [input, setInput] = useState(initialInput);
  const { data, isLoading, isError, isSuccess, error } =
    Hooks.useGetGlobusAuthUrl(
      {
        systemId,
      },
      {
        refetchOnWindowFocus: false,
      }
    );

  const {
    generate,
    isLoading: isLoadingGenTokens,
    isError: isErrorGenTokens,
    isSuccess: isSuccessGenTokens,
    error: errorGenTokens,
    reset,
    invalidate,
  } = Hooks.useGenerateGlobusTokens();

  const result = data?.result || undefined;

  console.log({ result });

  return (
    <Dialog
      open={open}
      onClose={() => {
        toggle();
      }}
      aria-labelledby="Authenticate with Globus"
      aria-describedby="A modal for authenticating with Globus"
      maxWidth="sm"
      fullWidth={true}
    >
      <DialogTitle id="alert-dialog-title">
        Authenticate with Globus
      </DialogTitle>
      <DialogContent>
        {isSuccessGenTokens && (
          <Alert severity="success" style={{ marginTop: '8px' }}>
            Successfully authenticated with Globus
          </Alert>
        )}
        {((isErrorGenTokens && errorGenTokens) || (isError && error)) && (
          <Alert
            severity="error"
            style={{ marginTop: '8px' }}
            onClose={() => {
              reset();
            }}
          >
            <AlertTitle>Error</AlertTitle>
            {error && error.message}
            {errorGenTokens && errorGenTokens.message}
          </Alert>
        )}
        {isSuccess && result && (
          <div>
            <Alert severity="info" style={{ marginTop: '8px' }}>
              <AlertTitle>Get Globus Authorization Code</AlertTitle>
              Click the <b>GET AUTHORIZATION CODE</b> button below to
              authenticate with Globus and retrieve your authorization code.
              This will authorize Tapis to access files in your Globus
              collection on your behalf.
              <div style={{ marginTop: '24px' }}>
                <a target="_blank" href={result.url}>
                  <Button startIcon={<Login />} size="small" variant="outlined">
                    Get authorization code
                  </Button>
                </a>
              </div>
            </Alert>
            <div className={styles['form']}>
              <FormControl variant="standard">
                <InputLabel htmlFor="auth-code">Authorization code</InputLabel>
                <Input
                  id="auth-code"
                  onChange={(e) => {
                    setInput({ authCode: e.target.value });
                  }}
                />
                <FormHelperText>
                  The Globus native app authroization code
                </FormHelperText>
              </FormControl>
            </div>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setInput(initialInput);
            reset();
            toggle();
          }}
        >
          {isSuccessGenTokens ? 'Continue' : 'Cancel'}
        </Button>
        <Button
          onClick={() => {
            generate(
              {
                systemId: systemId,
                sessionId: result?.sessionId!,
                authCode: input.authCode!,
              },
              {
                onSuccess: () => {
                  setInput(initialInput);
                  invalidate();
                },
              }
            );
          }}
          disabled={isError || isSuccessGenTokens || !input.authCode}
          loading={isLoadingGenTokens || isLoading}
          variant="outlined"
          autoFocus
        >
          Authenticate
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GlobusAuthModal;
