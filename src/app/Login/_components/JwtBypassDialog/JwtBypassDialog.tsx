import React, { useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Dialog,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { CloseRounded } from '@mui/icons-material';
import jwt_decode from 'jwt-decode';
import Cookies from 'js-cookie';
import { useTapisConfig, checkAccessToken } from '@tapis/tapisui-hooks';
import { Extension } from '@tapis/tapisui-extensions-core';
import { isLocalhost } from 'utils/resolveBasePath';
import { clearLoginReturn, readLoginReturn } from '../../loginReturn';
import loginStyles from '../Login/Login.module.scss';

// Every develop-site tenant (and any local dev server) gets the bypass no
// matter what an extension says.
export const isDevelopHost = (hostname = window.location.hostname) =>
  isLocalhost() || /(^|\.)develop\.tapis\.io$/i.test(hostname);

/**
 * Is the access-token sign-in offered here? On for every tenant unless the
 * deployment's extension says otherwise: debugging a sign-in without it is
 * hard, and it grants nothing devtools does not (the token still has to be
 * one the services accept). Per deployment, `authentication.jwtBypass`:
 *   false        off
 *   ['tacc',...] only for these tenant ids
 * The older `jwtBypassHosts` hostname list still works, [] meaning off.
 */
export const jwtBypassAllowed = (
  extension?: Extension,
  tenantId?: string
): boolean => {
  if (isDevelopHost()) return true;
  const setting = extension?.getJwtBypass();
  if (setting === false) return false;
  if (Array.isArray(setting)) return !!tenantId && setting.includes(tenantId);
  const hosts = extension?.getJwtBypassHosts();
  if (hosts) return hosts.includes(window.location.hostname);
  return true;
};

/** Long-press detector for the dialog's trigger element. Spread the returned
 *  handlers onto any element; a completed hold fires the callback and a
 *  release before the threshold does nothing. */
export const useLongPress = (onLongPress: () => void, ms = 3000) => {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const start = () => {
    timer.current = setTimeout(onLongPress, ms);
  };
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = undefined;
  };
  return {
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: cancel,
  };
};

// Pre-validate with the SAME rules useTapisConfig's auto-logout effect
// enforces (checkAccessToken) so a bad paste gets an inline error here
// instead of being accepted and then silently cleared on the next render.
const validateJwt = (
  jwt: string,
  basePath: string
): { error?: string; expiresAt?: string } => {
  const refusal = checkAccessToken(jwt, { basePath });
  if (refusal?.reason === 'unreadable') {
    return { error: 'This is not a token this page can read.' };
  }
  if (refusal?.reason === 'expired') {
    return { error: 'This token has expired.' };
  }
  if (refusal) {
    return {
      error: `This token is for the ${
        refusal.tenant
      } tenant, and this page is ${basePath || 'not tied to a tenant'}.`,
    };
  }
  const claims: { exp?: number } = jwt_decode(jwt);
  // Honor the token's real exp; fall back to the legacy 4 h guess only for
  // exp-less tokens.
  const expiresAt = claims.exp
    ? new Date(claims.exp * 1000).toISOString()
    : new Date(Date.now() + 14400 * 1000).toISOString();
  return { expiresAt };
};

const JwtBypassDialog: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const { basePath, pathTenantId, setAccessToken } = useTapisConfig();
  const history = useHistory();
  const location = useLocation<{
    from?: { pathname?: string; search?: string };
  }>();
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const host = (basePath ?? '').replace(/^https?:\/\//, '');

  const close = () => {
    setToken('');
    setError(undefined);
    onClose();
  };

  const submit = async () => {
    const jwt = token.trim();
    if (!jwt) return;
    const { error: err, expiresAt } = validateJwt(jwt, basePath);
    if (err) {
      setError(err);
      return;
    }
    // read first: a stored token makes the login page clear the return target
    const target = readLoginReturn(location.state?.from);
    await setAccessToken({
      access_token: jwt,
      expires_at: expiresAt,
      expires_in: Math.max(
        0,
        Math.floor((new Date(expiresAt!).getTime() - Date.now()) / 1000)
      ),
    });
    // Confirm the session took. A cookie can be dropped silently (over the
    // size limit, or `secure` on a plain http origin).
    let stored: string | undefined;
    try {
      stored = JSON.parse(Cookies.get('tapis-token') ?? 'null')?.access_token;
    } catch {
      stored = undefined;
    }
    if (stored !== jwt) {
      setError(
        'The token was accepted but the session could not be stored in this browser. Check that cookies are enabled for this site.'
      );
      return;
    }
    clearLoginReturn();
    close();
    history.push(target ?? '/');
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      aria-labelledby="jwt-bypass-dialog-title"
      PaperProps={{ sx: { width: '32rem', maxWidth: '92%', borderRadius: 2 } }}
    >
      <Box sx={{ position: 'relative', p: '1.4rem 1.4rem 1.1rem' }}>
        <IconButton
          aria-label="Close"
          size="small"
          onClick={close}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseRounded fontSize="small" />
        </IconButton>
        <Typography
          id="jwt-bypass-dialog-title"
          sx={{ fontSize: '0.95rem', fontWeight: 700, pr: 4 }}
        >
          Sign in with an access token
        </Typography>
        <Typography
          sx={{ mt: 0.75, fontSize: '0.8rem', lineHeight: 1.55, opacity: 0.85 }}
        >
          A debugging tool. Paste a Tapis access token you already hold (from
          another signed-in session, or one you created with the Tapis CLI).
        </Typography>
        <div className={loginStyles['adminNotice']}>
          <span className={loginStyles['amberDot']} />
          <span>
            Only paste a token you got yourself. A token someone hands you signs
            you in as them: everything you do here happens on their account.
          </span>
        </div>
        <TextField
          fullWidth
          autoFocus
          label="Access token"
          placeholder="eyJ..."
          size="small"
          value={token}
          error={!!error}
          helperText={error}
          type="password"
          inputProps={{
            autoComplete: 'off',
            style: { fontFamily: 'monospace', fontSize: '0.78rem' },
          }}
          sx={{ mt: 1.75 }}
          onChange={(e) => {
            setToken(e.target.value);
            setError(undefined);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
        />
        <Typography
          sx={{ mt: 1, fontSize: '0.72rem', color: 'text.secondary' }}
        >
          For the {host || 'current'} domain.
        </Typography>
        <Box
          sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}
        >
          <Button size="small" onClick={close}>
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            disableElevation
            disabled={!token.trim()}
            onClick={submit}
          >
            Sign in with this token
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default JwtBypassDialog;
