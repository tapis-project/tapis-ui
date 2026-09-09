/**
 * CredentialModalV2 — registering a credential, said the way this app now
 * says things.
 *
 * The v1 (tapisui-common AuthModal) was a stack of bare standard inputs
 * with paragraph-length helper texts, a create button that locked itself
 * after any error, and no sense of where the secret goes. This one:
 *
 * - opens knowing the host, the method, and who you'll be on the host —
 *   the context is the header, not a form field you have to interpret;
 * - shows only the fields the method asks for, secrets behind the eye,
 *   keys in monospace, the ssh-keygen line press-to-copy;
 * - holds the flight in view and puts a refusal right where the press
 *   happened (ErrorDetail, not a raw alert), and an error never locks
 *   the submit — fix the field and try again;
 * - on success, one button: Done — re-check access (the toggle re-runs
 *   the page's probe, so the door opens without a reload).
 *
 * Everything v1 could register still registers: PASSWORD, PKI_KEYS (with
 * loginUser for dynamic-user systems), ACCESS_KEY, CERT.
 */
import React, { useMemo, useState } from 'react';
import { Systems as Hooks, useTapisConfig } from '@tapis/tapisui-hooks';
import { Systems } from '@tapis/tapis-typescript';
import { useQueryClient } from 'react-query';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ContentCopyRounded,
  DoneRounded,
  KeyRounded,
  VisibilityOffRounded,
  VisibilityRounded,
} from '@mui/icons-material';
import { SystemTypeChip } from 'app/_components/NavV2Kit/SystemTypeTile';
import ErrorDetail from 'app/_components/ErrorDetail/ErrorDetail';

const FIELD_SX = {
  '& .MuiInputBase-root': { fontSize: '0.78rem' },
  '& .MuiInputLabel-root': { fontSize: '0.78rem' },
  '& .MuiFormHelperText-root': { fontSize: '0.66rem', mx: 0 },
} as const;

const MONO_FIELD_SX = {
  ...FIELD_SX,
  '& .MuiInputBase-root': {
    fontSize: '0.7rem',
    fontFamily: 'monospace',
  },
} as const;

const QUIET_BTN_SX = {
  textTransform: 'none',
  borderRadius: '5px',
  borderColor: 'divider',
  color: 'text.primary',
  fontSize: '0.75rem',
} as const;

/** a text field whose value is a secret: masked, with the eye */
const SecretField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  helper?: string;
  onEnter?: () => void;
}> = ({ label, value, onChange, helper, onEnter }) => {
  const [shown, setShown] = useState(false);
  return (
    <TextField
      size="small"
      fullWidth
      label={label}
      type={shown ? 'text' : 'password'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onEnter?.();
      }}
      helperText={helper}
      sx={FIELD_SX}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={() => setShown((s) => !s)}
              aria-label={shown ? `Hide ${label}` : `Show ${label}`}
              sx={{ p: 0.5 }}
            >
              {shown ? (
                <VisibilityOffRounded sx={{ fontSize: 16 }} />
              ) : (
                <VisibilityRounded sx={{ fontSize: 16 }} />
              )}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

/** one shell command, press-to-copy */
const CopyCmd: React.FC<{ cmd: string }> = ({ cmd }) => {
  const [copied, setCopied] = useState(false);
  return (
    <>
      <Typography
        sx={{
          fontFamily: 'monospace',
          fontSize: '0.72rem',
          bgcolor: 'rgba(0,0,0,0.05)',
          px: 0.75,
          py: '1px',
          borderRadius: '4px',
        }}
      >
        {cmd}
      </Typography>
      <Tooltip title={copied ? 'Copied' : 'Copy command'}>
        <IconButton
          size="small"
          sx={{ p: 0.25 }}
          aria-label={`Copy: ${cmd}`}
          onClick={() => {
            navigator.clipboard?.writeText(cmd);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? (
            <DoneRounded sx={{ fontSize: 14, color: 'success.main' }} />
          ) : (
            <ContentCopyRounded sx={{ fontSize: 14 }} />
          )}
        </IconButton>
      </Tooltip>
    </>
  );
};

/**
 * The ssh-keygen tip — a tip that does its own legwork. ed25519 leads:
 * it is the current standard and Tapis's SSH layer reads it (Apache MINA
 * SSHD with the eddsa provider, added to tapis-shared-java expressly
 * "for ed25519 support"). The old RSA/PEM line stays as the fallback for
 * hosts whose sshd predates ed25519.
 */
const KeygenTip: React.FC = () => (
  <Box
    sx={{
      border: '1px dashed',
      borderColor: 'divider',
      borderRadius: 1,
      px: 1.25,
      py: 0.75,
      bgcolor: '#fcfcfb',
    }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        flexWrap: 'wrap',
      }}
    >
      <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
        No pair yet? Make one:
      </Typography>
      <CopyCmd cmd="ssh-keygen -t ed25519" />
    </Box>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        flexWrap: 'wrap',
        mt: 0.5,
      }}
    >
      <Typography sx={{ fontSize: '0.68rem', color: 'text.disabled' }}>
        for an older host that refuses ed25519:
      </Typography>
      <CopyCmd cmd="ssh-keygen -t rsa -b 4096 -m PEM" />
    </Box>
    <Typography
      sx={{ fontSize: '0.68rem', color: '#7a5200', mt: 0.5, lineHeight: 1.5 }}
    >
      Skip the passphrase — Tapis uses the key non-interactively, and a locked
      key can never be presented. The public key must already sit in the
      host&apos;s authorized_keys — Tapis presents keys, it cannot install them.
    </Typography>
  </Box>
);

const CredentialModalV2: React.FC<{
  open: boolean;
  toggle: () => void;
  system: Systems.TapisSystem;
  /** the credential is stored — the page starts its patient recheck */
  onCredentialSaved?: () => void;
}> = ({ open, toggle, system, onCredentialSaved }) => {
  const { claims } = useTapisConfig();
  const tapisUserName = claims['tapis/username'];
  const dynamic = !!system.isDynamicEffectiveUser;
  const method = system.defaultAuthnMethod as Systems.AuthnEnum;

  const defaultUserName = dynamic
    ? tapisUserName
    : system.effectiveUserId || tapisUserName;

  const [userName, setUserName] = useState<string>(defaultUserName);
  const [password, setPassword] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [loginUser, setLoginUser] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [accessSecret, setAccessSecret] = useState('');
  const [cert, setCert] = useState('');

  const { create, isLoading, isError, isSuccess, error, reset } =
    Hooks.useCreateCredential();
  const queryClient = useQueryClient();

  const valid = useMemo(() => {
    if (!userName) return false;
    switch (method) {
      case Systems.AuthnEnum.Password:
        return !!password;
      case Systems.AuthnEnum.PkiKeys:
        return !!privateKey && !!publicKey;
      case Systems.AuthnEnum.AccessKey:
        return !!accessKey && !!accessSecret;
      case Systems.AuthnEnum.Cert:
        return !!cert;
      default:
        return false;
    }
  }, [
    method,
    userName,
    password,
    privateKey,
    publicKey,
    accessKey,
    accessSecret,
    cert,
  ]);

  const buildCredential = (): Systems.ReqUpdateCredential | undefined => {
    switch (method) {
      case Systems.AuthnEnum.Password:
        return { password };
      case Systems.AuthnEnum.PkiKeys:
        return {
          privateKey: privateKey.trim(),
          publicKey: publicKey.trim(),
          ...(loginUser ? { loginUser } : {}),
        };
      case Systems.AuthnEnum.AccessKey:
        return { accessKey, accessSecret };
      case Systems.AuthnEnum.Cert:
        return { certificate: cert };
      default:
        return undefined;
    }
  };

  const submit = () => {
    const reqUpdateCredential = buildCredential();
    if (!reqUpdateCredential || !valid || isLoading) return;
    create(
      { systemId: system.id!, userName, reqUpdateCredential },
      {
        onSuccess: () => {
          // ONLY the file listings — the page's access probe is one and
          // re-runs itself. The hook's own invalidate() also refetches the
          // systems window and detail, which a credential does not change.
          queryClient.invalidateQueries('files/list');
          // a host frequently refuses fresh keys for a few seconds — the
          // page keeps knocking on a backoff instead of failing once
          onCredentialSaved?.();
        },
      }
    );
  };

  const close = () => {
    if (isLoading) return;
    reset();
    toggle();
  };

  return (
    <Dialog open={open} onClose={close} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontSize: '0.95rem', fontWeight: 700, pb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <KeyRounded sx={{ fontSize: 17, color: '#7a5200' }} />
          Credentials for {system.id}
          <SystemTypeChip type={system.systemType} />
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pb: 2 }}>
        <Typography
          sx={{ fontSize: '0.76rem', color: 'text.secondary', mb: 1.5 }}
        >
          Tapis stores this with its Systems service and presents it on your
          behalf — listings, transfers and job launches all ride it. It is
          write-only: nothing saved here can be read back out.
        </Typography>

        {/* who, where — the context the old form made you type blind */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 1.5,
            flexWrap: 'wrap',
          }}
        >
          <Typography
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.74rem',
              bgcolor: 'rgba(0,0,0,0.04)',
              px: 0.75,
              py: '2px',
              borderRadius: '4px',
            }}
          >
            {system.host}
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
            as
          </Typography>
          <TextField
            size="small"
            label="user"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            sx={{ ...FIELD_SX, width: 180 }}
          />
          {dynamic && (
            <Typography sx={{ fontSize: '0.66rem', color: 'text.secondary' }}>
              dynamic-user system — this defaults to your Tapis username
            </Typography>
          )}
        </Box>

        {/* ── only what the method asks for ─────────────────────────── */}
        <Box sx={{ display: 'grid', gap: 1.25 }}>
          {method === Systems.AuthnEnum.Password && (
            <SecretField
              label="Password"
              value={password}
              onChange={setPassword}
              helper="the host account's password — not your Tapis one"
              onEnter={submit}
            />
          )}

          {method === Systems.AuthnEnum.PkiKeys && (
            <>
              <KeygenTip />
              <TextField
                size="small"
                fullWidth
                multiline
                minRows={4}
                label="Private key"
                placeholder={'-----BEGIN RSA PRIVATE KEY-----\n…'}
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                sx={MONO_FIELD_SX}
              />
              <TextField
                size="small"
                fullWidth
                multiline
                minRows={2}
                label="Public key"
                placeholder="ssh-rsa AAAA… user@host"
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                helperText="the pair's public half — the one already on the host"
                sx={MONO_FIELD_SX}
              />
              {dynamic && (
                <TextField
                  size="small"
                  fullWidth
                  label="Login user (optional)"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  helperText="the host account to become when it differs from your Tapis username"
                  sx={FIELD_SX}
                />
              )}
            </>
          )}

          {method === Systems.AuthnEnum.AccessKey && (
            <>
              <TextField
                size="small"
                fullWidth
                label="Access key"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                sx={MONO_FIELD_SX}
              />
              <SecretField
                label="Access secret"
                value={accessSecret}
                onChange={setAccessSecret}
                onEnter={submit}
              />
            </>
          )}

          {method === Systems.AuthnEnum.Cert && (
            <TextField
              size="small"
              fullWidth
              multiline
              minRows={4}
              label="Certificate"
              value={cert}
              onChange={(e) => setCert(e.target.value)}
              sx={MONO_FIELD_SX}
            />
          )}
        </Box>

        {/* the refusal, right where the press happened — and it never
            locks the button: fix the field and go again */}
        {isError && error && !isLoading && (
          <Box sx={{ mt: 1.5 }}>
            <Typography
              sx={{ fontSize: '0.72rem', color: 'error.main', mb: 0.5 }}
            >
              The service refused the credential:
            </Typography>
            <ErrorDetail message={error.message} fontSize="0.72rem" />
          </Box>
        )}

        {isSuccess ? (
          <Box sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'center' }}>
            <DoneRounded sx={{ fontSize: 16, color: 'success.main' }} />
            <Typography sx={{ fontSize: '0.76rem', color: 'success.main' }}>
              Credential stored.
            </Typography>
            <Button
              size="small"
              variant="contained"
              disableElevation
              onClick={close}
              sx={{ textTransform: 'none', fontSize: '0.75rem', ml: 1 }}
            >
              Done — re-check access
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'center' }}>
            <Button
              size="small"
              variant="contained"
              disableElevation
              disabled={!valid || isLoading}
              startIcon={
                isLoading ? (
                  <CircularProgress size={13} sx={{ color: 'inherit' }} />
                ) : (
                  <KeyRounded sx={{ fontSize: 15 }} />
                )
              }
              onClick={submit}
              sx={{ textTransform: 'none', fontSize: '0.75rem' }}
            >
              {isLoading ? 'Storing…' : 'Store credential'}
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={close}
              sx={QUIET_BTN_SX}
            >
              Cancel
            </Button>
            {isLoading && (
              <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
                handing the secret to the Systems service…
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CredentialModalV2;
