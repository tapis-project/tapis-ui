/**
 * AuthMethodsModal — the auth-method matrix, one click from the auth fact.
 *
 * The card can say "not permitted to check" but not WHY a whole method
 * behaves that way — TMS keys, Globus consents and tokens are not host
 * dials, so the check refusing them is the design, not a fault. This modal
 * is where that lives: what each method asks of a person, who usually
 * registers it, and whether the check's dial can exercise it at all.
 */
import React from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { KeyRounded } from '@mui/icons-material';

type MethodRow = {
  method: string;
  provide: string;
  registeredBy: string;
  dial: 'yes' | 'no';
  dialNote?: string;
};

const ROWS: MethodRow[] = [
  {
    method: 'PASSWORD',
    provide: "the host account's username and password",
    registeredBy: 'each user, for themselves',
    dial: 'yes',
  },
  {
    method: 'PKI_KEYS',
    provide: 'an SSH keypair — the public half already on the host',
    registeredBy: 'each user; the owner, for a shared account',
    dial: 'yes',
  },
  {
    method: 'TMS_KEYS',
    provide: 'nothing — one press mints and registers a pair',
    registeredBy: 'the TMS service, on your press',
    dial: 'no',
    dialNote: 'TMS-managed keys refuse the dial — shows "not permitted"',
  },
  {
    method: 'ACCESS_KEY',
    provide: 'an S3 access key and secret',
    registeredBy: 'usually the owner (the bucket is one account)',
    dial: 'yes',
  },
  {
    method: 'CERT',
    provide: 'a signed SSH certificate',
    registeredBy: 'each user',
    dial: 'no',
  },
  {
    method: 'TOKEN',
    provide: 'an access token',
    registeredBy: 'each user',
    dial: 'no',
  },
  {
    method: 'GLOBUS',
    provide: 'a consent, granted in a browser round-trip',
    registeredBy: 'each user',
    dial: 'no',
    dialNote: 'Globus holds tokens, not host credentials',
  },
];

const HCELL_SX = {
  textAlign: 'left' as const,
  fontSize: '0.62rem',
  fontWeight: 700,
  color: 'text.secondary',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
  py: 0.5,
  px: 0.75,
  whiteSpace: 'nowrap' as const,
};

const CELL_SX = {
  fontSize: '0.72rem',
  py: 0.55,
  px: 0.75,
  verticalAlign: 'top' as const,
};

/** the "this is you, here" marker both tables wear on their applicable row */
const ThisTag: React.FC = () => (
  <Typography
    component="span"
    sx={{
      fontSize: '0.62rem',
      color: '#5f4bb5',
      ml: 0.5,
      fontFamily: 'inherit',
      whiteSpace: 'nowrap',
    }}
  >
    · this system
  </Typography>
);

const HIGHLIGHT_ROW_SX = { bgcolor: 'rgba(157,133,239,0.08)' } as const;

const AuthMethodsModal: React.FC<{
  open: boolean;
  toggle: () => void;
  /** the method this system uses — its row is tinted */
  highlight?: string;
  /** the reader's Tapis username, so the identity examples are literal */
  me?: string;
  /** which identity shape THIS system is — its row is tinted too */
  dynamic?: boolean;
  /** the shared host account, when static — shown by name, not by example */
  account?: string;
}> = ({ open, toggle, highlight, me, dynamic, account }) => (
  <Dialog open={open} onClose={toggle} maxWidth="md" fullWidth>
    <DialogTitle sx={{ fontSize: '0.95rem', fontWeight: 700, pb: 0.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <KeyRounded sx={{ fontSize: 17, color: '#7a5200' }} />
        How systems authenticate
      </Box>
    </DialogTitle>
    <DialogContent sx={{ pb: 2 }}>
      <Typography sx={{ fontSize: '0.76rem', color: 'text.secondary', mb: 1 }}>
        Every system names a default method — what a credential IS for that host
        — and an <strong>on host as</strong> account that decides whose
        credential is in play:
      </Typography>
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
          mb: 1.25,
        }}
      >
        <Box
          component="table"
          sx={{ width: '100%', borderCollapse: 'collapse' }}
        >
          <Box component="thead" sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
            <Box component="tr">
              <Typography component="th" sx={HCELL_SX}>
                on host as
              </Typography>
              <Typography component="th" sx={HCELL_SX}>
                you land as
              </Typography>
              <Typography component="th" sx={HCELL_SX}>
                whose credential
              </Typography>
            </Box>
          </Box>
          <Box component="tbody">
            <Box
              component="tr"
              sx={{
                borderTop: '1px solid',
                borderColor: 'divider',
                ...(dynamic === true && HIGHLIGHT_ROW_SX),
              }}
            >
              <Typography
                component="td"
                sx={{ ...CELL_SX, fontFamily: 'monospace', fontWeight: 600 }}
              >
                {'${apiUserId}'}
                {dynamic === true && <ThisTag />}
              </Typography>
              <Typography component="td" sx={CELL_SX}>
                yourself — your Tapis username
                {me ? (
                  <>
                    {' '}
                    (<code>{me}</code>)
                  </>
                ) : (
                  ''
                )}
                , unless a registered <code>loginUser</code> mapping names a
                different host account for you
              </Typography>
              <Typography component="td" sx={CELL_SX}>
                your own — each person registers theirs
              </Typography>
            </Box>
            <Box
              component="tr"
              sx={{
                borderTop: '1px solid',
                borderColor: 'divider',
                ...(dynamic === false && HIGHLIGHT_ROW_SX),
              }}
            >
              <Typography
                component="td"
                sx={{ ...CELL_SX, fontFamily: 'monospace', fontWeight: 600 }}
              >
                {dynamic === false && account ? (
                  <>
                    {account}
                    <ThisTag />
                  </>
                ) : (
                  <>a fixed name — one account for everyone</>
                )}
              </Typography>
              <Typography component="td" sx={CELL_SX}>
                {dynamic === false && account ? (
                  <>
                    the shared account <code>{account}</code>, whoever you are
                  </>
                ) : (
                  'that shared account, whoever you are'
                )}
              </Typography>
              <Typography component="td" sx={CELL_SX}>
                the shared account&apos;s — usually registered once by the
                owner; your access rides the share
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      <Typography sx={{ fontSize: '0.76rem', color: 'text.secondary', mb: 1 }}>
        And the method itself — what you hand over, and what the card&apos;s
        checks can do with it:
      </Typography>
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <Box
          component="table"
          sx={{ width: '100%', borderCollapse: 'collapse' }}
        >
          <Box component="thead" sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
            <Box component="tr">
              <Typography component="th" sx={HCELL_SX}>
                Method
              </Typography>
              <Typography component="th" sx={HCELL_SX}>
                You provide
              </Typography>
              <Typography component="th" sx={HCELL_SX}>
                Registered by
              </Typography>
              <Typography component="th" sx={HCELL_SX}>
                Check can dial?
              </Typography>
            </Box>
          </Box>
          <Box component="tbody">
            {ROWS.map((row) => (
              <Box
                component="tr"
                key={row.method}
                sx={{
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  ...(row.method === highlight && HIGHLIGHT_ROW_SX),
                }}
              >
                <Typography
                  component="td"
                  sx={{ ...CELL_SX, fontFamily: 'monospace', fontWeight: 600 }}
                >
                  {row.method}
                  {row.method === highlight && <ThisTag />}
                </Typography>
                <Typography component="td" sx={CELL_SX}>
                  {row.provide}
                </Typography>
                <Typography component="td" sx={CELL_SX}>
                  {row.registeredBy}
                </Typography>
                <Typography
                  component="td"
                  sx={{
                    ...CELL_SX,
                    color: row.dial === 'yes' ? '#1b7f3b' : 'text.secondary',
                  }}
                >
                  {row.dial}
                  {row.dialNote && (
                    <Typography
                      component="span"
                      sx={{ fontSize: '0.66rem', color: 'text.disabled' }}
                    >
                      {' '}
                      — {row.dialNote}
                    </Typography>
                  )}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
      <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', mt: 1 }}>
        The dial column is what the Systems service accepts for its checkCred
        operation (LINUX and S3 hosts) — a method it cannot dial shows as
        &quot;not permitted to check&quot; on the card, which is the design, not
        a fault. The access probe (a real listing) works for every method.
      </Typography>
    </DialogContent>
  </Dialog>
);

export default AuthMethodsModal;
