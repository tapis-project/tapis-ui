import React, { useState } from 'react';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import { Systems } from '@tapis/tapis-typescript';
import styles from './AuthModal.module.scss';
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

type ModalProps = {
  open: boolean;
  toggle: () => void;
  systemId: string;
  defaultAuthnMethod: Systems.AuthnEnum;
};

type PKIKeys = {
  publicKey?: string;
  privateKey?: string;
  loginUser?: string;
};

type AccessKey = {
  accessKey?: string;
  accessSecret?: string;
};

type InputState = {
  pkiKeys: PKIKeys;
  password: string | undefined;
  accessKey: AccessKey;
  cert: string | undefined;
};

const AuthModal: React.FC<ModalProps> = ({
  open,
  toggle,
  systemId,
  defaultAuthnMethod,
}) => {
  const initialInput: InputState = {
    pkiKeys: {
      publicKey: undefined,
      privateKey: undefined,
      loginUser: undefined,
    },
    accessKey: {
      accessKey: undefined,
      accessSecret: undefined,
    },
    password: undefined,
    cert: undefined,
  };
  const [input, setInput] = useState(initialInput);
  const { create, isLoading, isError, isSuccess, error, reset, invalidate } =
    Hooks.useCreateCredential();

  const buildReqUpdateCredential = (
    defaultAuthnMethod: Systems.AuthnEnum,
    input: InputState
  ): Systems.ReqUpdateCredential | undefined => {
    switch (defaultAuthnMethod) {
      case Systems.AuthnEnum.PkiKeys:
        return {
          publicKey: input.pkiKeys.publicKey!,
          // Escape newlines in private key
          privateKey: input.pkiKeys.privateKey!.trim().replace(/\n/gm, '\n'),
          loginUser: input.pkiKeys.loginUser,
        };
      case Systems.AuthnEnum.AccessKey:
        return {
          accessKey: input.accessKey.accessKey!,
          accessSecret: input.accessKey.accessSecret!,
        };
      case Systems.AuthnEnum.Cert:
        return { certificate: input.cert! };
      case Systems.AuthnEnum.Password:
        return { password: input.password! };
    }
  };

  const validateCredential = (
    defaultAuthnMethod: Systems.AuthnEnum,
    input: InputState
  ): boolean => {
    switch (defaultAuthnMethod) {
      case Systems.AuthnEnum.PkiKeys:
        return !!input.pkiKeys.privateKey && !!input.pkiKeys.publicKey;
      case Systems.AuthnEnum.AccessKey:
        return !!input.accessKey.accessKey && !!input.accessKey.accessSecret;
      case Systems.AuthnEnum.Cert:
        return !!input.cert;
      case Systems.AuthnEnum.Password:
        return !!input.password;
      default:
        return false;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        toggle();
      }}
      aria-labelledby="Create system credentials"
      aria-describedby="A modal for creating system credentials"
      maxWidth="sm"
      fullWidth={true}
    >
      <DialogTitle id="alert-dialog-title">Create credentials</DialogTitle>
      <DialogContent>
        {isSuccess && (
          <Alert severity="success" style={{ marginTop: '8px' }}>
            Successfully created credentials
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
        <div>
          {defaultAuthnMethod === Systems.AuthnEnum.PkiKeys && (
            <Alert severity="info" style={{ marginTop: '8px' }}>
              You can generate an ssh key-pair by running the following command
              in a shell.
              <br />
              <br />
              <b>ssh-keygen -t rsa -b 4096 -m PEM</b>
              <br />
              <br />
              Ensure that the public key you paste below has already been placed
              on the host for this system or Tapis will not be able to
              authenticate with the host on your behalf.
            </Alert>
          )}

          {defaultAuthnMethod === Systems.AuthnEnum.PkiKeys && (
            <div className={styles['form']}>
              <FormControl variant="standard">
                <InputLabel htmlFor="private-key">Private key</InputLabel>
                <Input
                  id="private-key"
                  required
                  multiline
                  rows={4}
                  onChange={(e) => {
                    setInput({
                      ...input,
                      pkiKeys: {
                        ...input.pkiKeys,
                        privateKey: e.target.value,
                      },
                    });
                  }}
                />
                <FormHelperText>The private key</FormHelperText>
              </FormControl>
              <FormControl variant="standard">
                <InputLabel htmlFor="public-key">Public key</InputLabel>
                <Input
                  id="public-key"
                  required
                  multiline
                  rows={4}
                  onChange={(e) => {
                    setInput({
                      ...input,
                      pkiKeys: {
                        ...input.pkiKeys,
                        publicKey: e.target.value,
                      },
                    });
                  }}
                />
                <FormHelperText>
                  The public key that corresponds to the private key above.
                </FormHelperText>
              </FormControl>
              <FormControl variant="standard">
                <InputLabel htmlFor="login-user">Login user</InputLabel>
                <Input
                  id="login-user"
                  onChange={(e) => {
                    setInput({
                      ...input,
                      pkiKeys: {
                        ...input.pkiKeys,
                        loginUser: e.target.value,
                      },
                    });
                  }}
                />
                <FormHelperText>
                  Optional: 'loginUser' may be included in order to map the
                  Tapis user to a username to be used when accessing the system.
                  If the login user is not provided then there is no mapping and
                  the Tapis user is always used when accessing the system
                </FormHelperText>
              </FormControl>
            </div>
          )}
          {defaultAuthnMethod === Systems.AuthnEnum.AccessKey && (
            <div className={styles['form']}>
              <FormControl variant="standard">
                <InputLabel htmlFor="access-key">Access key</InputLabel>
                <Input
                  id="access-key"
                  required
                  onChange={(e) => {
                    setInput({
                      ...input,
                      accessKey: {
                        ...input.accessKey,
                        accessKey: e.target.value,
                      },
                    });
                  }}
                />
                <FormHelperText>The access key</FormHelperText>
              </FormControl>
              <FormControl variant="standard">
                <InputLabel htmlFor="access-secret">Access Secret</InputLabel>
                <Input
                  id="access-secret"
                  required
                  onChange={(e) => {
                    setInput({
                      ...input,
                      accessKey: {
                        ...input.accessKey,
                        accessSecret: e.target.value,
                      },
                    });
                  }}
                />
                <FormHelperText>The access secret</FormHelperText>
              </FormControl>
            </div>
          )}
          {defaultAuthnMethod === Systems.AuthnEnum.Password && (
            <div className={styles['form']}>
              <FormControl variant="standard">
                <InputLabel htmlFor="password">Password</InputLabel>
                <Input
                  id="password"
                  required
                  type="password"
                  onChange={(e) => {
                    setInput({
                      ...input,
                      password: e.target.value,
                    });
                  }}
                />
                <FormHelperText>
                  The password to access the system
                </FormHelperText>
              </FormControl>
            </div>
          )}
          {defaultAuthnMethod === Systems.AuthnEnum.Cert && (
            <div className={styles['form']}>
              <FormControl variant="standard">
                <InputLabel htmlFor="certificate">Certificate</InputLabel>
                <Input
                  id="certificate"
                  required
                  multiline
                  rows={4}
                  onChange={(e) => {
                    setInput({
                      ...input,
                      cert: e.target.value,
                    });
                  }}
                />
                <FormHelperText>The certificate</FormHelperText>
              </FormControl>
            </div>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button
          color={isSuccess ? 'primary' : 'error'}
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
            const reqUpdateCredential = buildReqUpdateCredential(
              defaultAuthnMethod,
              input
            );
            if (reqUpdateCredential) {
              create(
                {
                  systemId,
                  reqUpdateCredential,
                },
                {
                  onSuccess: () => {
                    invalidate();
                    setInput(initialInput);
                  },
                }
              );
            }
          }}
          disabled={
            isError ||
            isSuccess ||
            !validateCredential(defaultAuthnMethod, input)
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

export default AuthModal;
