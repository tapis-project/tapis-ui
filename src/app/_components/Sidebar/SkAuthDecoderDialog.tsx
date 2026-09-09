import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

/**
 * Paste-a-stack-trace decoder for Tapis Security Kernel authorization
 * failures (SK_API_AUTHORIZATION_FAILED). SK reports three identities
 * (request, jwt, obo) plus the list of checks that all failed; this parses
 * them out, compares them against the logged-in session, and explains the
 * likely mismatch in plain language.
 */

type Identity = { tenant: string; user: string };

type Parsed = {
  request?: Identity;
  jwt?: Identity;
  obo?: Identity;
  account?: string;
  checks: string[];
  isSkFailure: boolean;
};

const IDENT_RE = (label: string) =>
  new RegExp(`${label}\\s+tenant/user=([\\w.-]+)/([\\w.@-]+)`, 'i');

const parseSkError = (text: string): Parsed => {
  const parsed: Parsed = {
    checks: [],
    isSkFailure: /SK_API_AUTHORIZATION_FAILED/i.test(text),
  };
  const req = text.match(IDENT_RE('(?:for\\s+)?request'));
  if (req) parsed.request = { tenant: req[1], user: req[2] };
  const jwt = text.match(IDENT_RE('jwt'));
  if (jwt) parsed.jwt = { tenant: jwt[1], user: jwt[2] };
  const obo = text.match(IDENT_RE('obo'));
  if (obo) parsed.obo = { tenant: obo[1], user: obo[2] };
  const account = text.match(/account=(\w+)/i);
  if (account) parsed.account = account[1].toLowerCase();
  // The failed checks trail the identity parenthetical: "...):  A, B, C".
  // Capture to end-of-line only so trailing pasted prose isn't swallowed.
  const checks = text.match(/\)\s*:\s*([^\n]+)/);
  if (checks) {
    parsed.checks = checks[1]
      .split(',')
      .map((c) => c.trim())
      .filter((c) => /^[A-Za-z][A-Za-z0-9_]*$/.test(c));
  }
  return parsed;
};

/** What each SK authorization predicate actually tests. */
const CHECK_EXPLANATIONS: Record<string, string> = {
  IsTenantAdmin:
    'Is the effective identity an administrator of the request tenant?',
  IsSiteAdmin: 'Is the effective identity the site-admin account?',
  OwnedRoles:
    'Does the effective identity own the role being read or modified? (Role operations only — the owner is whoever created the role.)',
  MatchRequestUser:
    'Does the effective (OBO) user match the user the request is about? This is the self-service path.',
  IsService: 'Is the caller authenticated as a Tapis service account?',
  IsAdmin: 'Does the effective identity hold the tenant admin role?',
};

type Diagnosis = { severity: 'error' | 'warning' | 'info'; text: string };

const diagnose = (
  p: Parsed,
  currentUser?: string,
  currentTenant?: string
): Diagnosis[] => {
  const out: Diagnosis[] = [];
  if (p.account === 'service' && p.obo && p.request) {
    if (p.obo.user !== p.request.user) {
      out.push({
        severity: 'error',
        text:
          `The service acted as itself: SK's effective identity is the OBO user ` +
          `"${p.obo.user}", but the request targets "${p.request.user}". If the call ` +
          `began as a user request, the X-Tapis-User header was not propagated — it ` +
          `defaulted to the service's own name. Either forward the original user in ` +
          `X-Tapis-User, or make the call as an identity that passes one of the ` +
          `admin/owner checks below.`,
      });
    } else {
      out.push({
        severity: 'warning',
        text:
          `The OBO user matches the request user, so identity propagation looks right — ` +
          `"${p.obo.user}" simply lacks every permission this endpoint accepts ` +
          `(see the failed checks). A role or admin grant in tenant ` +
          `"${p.request.tenant}" is what's missing.`,
      });
    }
  }
  if (p.obo && p.request && p.obo.tenant !== p.request.tenant) {
    out.push({
      severity: 'error',
      text:
        `Tenant mismatch: the OBO tenant is "${p.obo.tenant}" but the request is ` +
        `scoped to "${p.request.tenant}". SK evaluates permissions in the request ` +
        `tenant, and grants do not cross tenants.`,
    });
  }
  if (p.checks.length > 0 && !p.checks.includes('MatchRequestUser')) {
    out.push({
      severity: 'info',
      text:
        `The failed-check list has no self-service path (no MatchRequestUser), so ` +
        `this endpoint is admin-or-owner only — being the user the request is about ` +
        `would not have helped.`,
    });
  }
  if (p.checks.includes('OwnedRoles')) {
    out.push({
      severity: 'info',
      text:
        `OwnedRoles in the list means this was a role operation (grantRole, ` +
        `revokeUserRole, createRole, …). Role grants of type USER are allowed for ` +
        `the role's owner, a tenant admin, or a site admin.`,
    });
  }
  if (currentUser && p.request && p.request.user === currentUser) {
    out.push({
      severity: 'info',
      text:
        `The request targets your current login (${currentUser}` +
        `${
          currentTenant ? '@' + currentTenant : ''
        }) — someone/something was ` +
        `trying to change or read *your* record when this failed.`,
    });
  }
  return out;
};

const MONO_SX = { fontFamily: 'monospace', fontSize: '0.8rem' } as const;

// A realistic failure the parser fully understands — the primer highlights
// its parts, and "Try the example" runs it through the decoder.
const EXAMPLE_ERROR =
  'SK_API_AUTHORIZATION_FAILED These authorization checks failed for request tenant/user=tacc/jdoe (jwt tenant/user=admin/systems, obo tenant/user=tacc/systems, account=service): IsTenantAdmin, OwnedRoles, MatchRequestUser';

const Hl: React.FC<{ c: string; children: React.ReactNode }> = ({
  c,
  children,
}) => (
  <Box
    component="span"
    sx={{ color: c, bgcolor: alpha(c, 0.09), borderRadius: '3px', px: 0.25 }}
  >
    {children}
  </Box>
);

const IdentityRow: React.FC<{
  label: string;
  meaning: string;
  ident?: Identity;
  chips: { label: string; color: 'success' | 'error' | 'default' }[];
}> = ({ label, meaning, ident, chips }) => (
  <TableRow>
    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
      {label}
    </TableCell>
    <TableCell sx={MONO_SX}>
      {ident ? `${ident.tenant} / ${ident.user}` : '—'}
      {chips.map((c) => (
        <Chip
          key={c.label}
          label={c.label}
          color={c.color}
          size="small"
          variant="outlined"
          sx={{ ml: 0.75, height: 18, fontSize: '0.65rem' }}
        />
      ))}
    </TableCell>
    <TableCell sx={{ color: 'text.secondary' }}>{meaning}</TableCell>
  </TableRow>
);

// The decoder's whole UI minus the dialog shell, so it can live inside the
// Settings panel as a section body as well as the (legacy) dialog.
export const SkAuthDecoderContent: React.FC<{
  currentUser?: string;
  currentTenant?: string;
  autoFocus?: boolean;
  primer?: boolean; // the annotated-example info box (settings section shows it)
}> = ({ currentUser, currentTenant, autoFocus = false, primer = false }) => {
  const [text, setText] = useState('');
  const parsed = useMemo(() => parseSkError(text), [text]);
  const hasIdentities = !!(parsed.request || parsed.jwt || parsed.obo);
  const diagnoses = useMemo(
    () => diagnose(parsed, currentUser, currentTenant),
    [parsed, currentUser, currentTenant]
  );

  const youChip = (ident?: Identity) => {
    if (!ident || !currentUser) return [];
    return ident.user === currentUser && ident.tenant === currentTenant
      ? [{ label: 'you', color: 'success' as const }]
      : [];
  };
  const oboMismatch =
    parsed.obo && parsed.request && parsed.obo.user !== parsed.request.user;

  return (
    <>
      {primer && (
        <Box
          sx={{
            mb: 1.5,
            px: 1.5,
            py: 1,
            bgcolor: '#f6f7f9',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <Typography
            sx={{
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'text.secondary',
              mb: 0.5,
            }}
          >
            Anatomy of an SK failure
          </Typography>
          <Typography
            component="div"
            sx={{ ...MONO_SX, fontSize: '0.72rem', mb: 0.75 }}
          >
            …SK_API_AUTHORIZATION_FAILED These authorization checks failed for
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              columnGap: 2,
              rowGap: 0.5,
              alignItems: 'baseline',
              pl: 1,
            }}
          >
            {(
              [
                [
                  'request tenant/user=tacc/jdoe',
                  '#6d4fc4',
                  'who the call is about',
                ],
                [
                  'jwt tenant/user=admin/systems',
                  '#0277bd',
                  'who the token was issued to',
                ],
                [
                  'obo tenant/user=tacc/systems',
                  '#2e7d32',
                  'the identity SK actually judges (X-Tapis-Tenant/-User)',
                ],
                [
                  'account=service',
                  '#ed6c02',
                  'service tokens may act on behalf of others',
                ],
                [
                  'IsTenantAdmin, OwnedRoles, MatchRequestUser',
                  '#c62828',
                  'every check SK tried — any one passing allows the call',
                ],
              ] as [string, string, string][]
            ).map(([frag, c, note]) => (
              <React.Fragment key={frag}>
                <Typography
                  component="div"
                  sx={{ ...MONO_SX, fontSize: '0.72rem' }}
                >
                  <Hl c={c}>{frag}</Hl>
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ minWidth: 0 }}
                >
                  {note}
                </Typography>
              </React.Fragment>
            ))}
          </Box>
          <Button
            size="small"
            onClick={() => setText(EXAMPLE_ERROR)}
            sx={{ mt: 0.75, textTransform: 'none', fontSize: 11 }}
          >
            Try the example
          </Button>
        </Box>
      )}
      <TextField
        fullWidth
        multiline
        minRows={3}
        maxRows={8}
        autoFocus={autoFocus}
        placeholder="Paste a tapipy / SK error, e.g. … SK_API_AUTHORIZATION_FAILED These authorization checks failed for request tenant/user=…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        InputProps={{ sx: MONO_SX }}
        sx={{ mb: text.trim() ? 0.5 : 2 }}
      />
      {text.trim() && (
        <Box sx={{ mb: 1.5 }}>
          <Button size="small" onClick={() => setText('')}>
            Clear
          </Button>
        </Box>
      )}

      {!text.trim() && (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Tip: SK failures always name three identities — request (who it's
          about), jwt (who the token belongs to), and obo (who the service
          claims to act for). The mismatch between them is usually the whole
          story.
        </Typography>
      )}

      {text.trim() && !hasIdentities && (
        <Typography variant="body2" sx={{ color: 'warning.main' }}>
          Couldn't find any <code>tenant/user=</code> identities in that text.
          Paste the full error message — the part starting at
          "SK_API_AUTHORIZATION_FAILED".
        </Typography>
      )}

      {hasIdentities && (
        <>
          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            Identities
          </Typography>
          <Table size="small" sx={{ mb: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>Field</TableCell>
                <TableCell>tenant / user</TableCell>
                <TableCell>Meaning</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <IdentityRow
                label="request"
                ident={parsed.request}
                meaning="Who the operation is about — the target of the call."
                chips={youChip(parsed.request)}
              />
              <IdentityRow
                label="jwt"
                ident={parsed.jwt}
                meaning={
                  parsed.account === 'service'
                    ? 'Who the token was issued to — a service account, in its admin tenant.'
                    : 'Who the token was issued to.'
                }
                chips={youChip(parsed.jwt)}
              />
              <IdentityRow
                label="obo"
                ident={parsed.obo}
                meaning="X-Tapis-Tenant / X-Tapis-User — the effective identity SK evaluates."
                chips={[
                  ...youChip(parsed.obo),
                  ...(oboMismatch
                    ? [{ label: '≠ request user', color: 'error' as const }]
                    : []),
                ]}
              />
              {parsed.account && (
                <TableRow>
                  <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
                    account
                  </TableCell>
                  <TableCell sx={MONO_SX}>{parsed.account}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>
                    {parsed.account === 'service'
                      ? 'A service token — OBO headers are required and trusted.'
                      : 'A regular user token — OBO headers are ignored.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {parsed.checks.length > 0 && (
            <>
              <Typography variant="subtitle2">
                Failed checks — SK tried each of these and none passed
              </Typography>
              <Box component="ul" sx={{ mt: 0.5, mb: 2, pl: 3 }}>
                {parsed.checks.map((c) => (
                  <li key={c}>
                    <Typography variant="body2" component="span">
                      <b>{c}</b>
                      {' — '}
                      {CHECK_EXPLANATIONS[c] ??
                        'SK authorization predicate (no local description).'}
                    </Typography>
                  </li>
                ))}
              </Box>
            </>
          )}

          {diagnoses.length > 0 && (
            <>
              <Typography variant="subtitle2">Diagnosis</Typography>
              <Box component="ul" sx={{ mt: 0.5, pl: 3 }}>
                {diagnoses.map((d, i) => (
                  <li key={i}>
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{
                        color:
                          d.severity === 'error'
                            ? 'error.main'
                            : d.severity === 'warning'
                            ? 'warning.main'
                            : 'text.primary',
                      }}
                    >
                      {d.text}
                    </Typography>
                  </li>
                ))}
              </Box>
            </>
          )}
        </>
      )}
    </>
  );
};

const SkAuthDecoderDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  currentUser?: string;
  currentTenant?: string;
}> = ({ open, onClose, currentUser, currentTenant }) => (
  <Dialog
    fullWidth
    open={open}
    onClose={onClose}
    PaperProps={{
      style: { maxHeight: '95%', width: '56rem', maxWidth: '85%' },
    }}
  >
    <DialogTitle>Decode SK Authorization Error</DialogTitle>
    <DialogContent>
      <SkAuthDecoderContent
        currentUser={currentUser}
        currentTenant={currentTenant}
        autoFocus
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
);

export default SkAuthDecoderDialog;
