import React, { useState } from 'react';
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { OpenInNew } from '@mui/icons-material';
import { TextCopyField } from '@tapis/tapisui-common';

// ── LoginUrlSection ───────────────────────────────────────────────────────────
// The client card records a client_id and a callback_url, but the thing people
// actually need from it is the URL you send a user to in order to log in
// against that client. Everyone was hand-assembling it, and hand-assembling it
// is where the encoding goes wrong: redirect_uri must be percent-encoded
// exactly once, and a double-encoded one (%253A instead of %3A) fails the
// authenticator's "does not match the registered callback_url" check with an
// error that does not say encoding anywhere.
//
// So: build it here, off the client's own registered callback_url, and let the
// user copy it.
//
// The entry point is /v3/oauth2/authorize, not /v3/oauth2/login. Both work:
// authorize 302s straight to login with the same query — but authorize is what
// the tenant advertises as its authorization_endpoint in
// /v3/oauth2/.well-known/oauth-authorization-server, so it is what we hand out.

export type AuthFlow = 'code' | 'token';

export const buildAuthorizeUrl = ({
  basePath,
  clientId,
  callbackUrl,
  flow,
}: {
  basePath?: string;
  clientId?: string;
  callbackUrl?: string;
  flow: AuthFlow;
}): string | undefined => {
  if (!basePath || !clientId || !callbackUrl) return undefined;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    response_type: flow,
  });
  // TapisUI's own implicit sign-in sends this and the authenticator expects it
  // (see Login.tsx) even though the iframe mode it refers to is long gone. It
  // has no meaning for the code flow, so it only goes on the implicit URL.
  if (flow === 'token') params.set('use_iframe_redirect', 'false');
  // URLSearchParams form-encodes the value, which is what redirect_uri wants:
  // ':' -> %3A, '/' -> %2F, '#' -> %23, applied exactly once.
  return `${basePath.replace(
    /\/$/,
    ''
  )}/v3/oauth2/authorize?${params.toString()}`;
};

const FLOWS: Record<AuthFlow, { label: string; returns: string }> = {
  code: {
    label: 'Authorization code',
    returns:
      'For apps with a backend. Tapis sends the user back to the callback with ' +
      '?code=…, which your server exchanges for a token at /v3/oauth2/token ' +
      'using this client’s key.',
  },
  token: {
    label: 'Implicit (token)',
    returns:
      'For browser apps with no backend. Tapis sends the user back to the ' +
      'callback with #access_token=… in the URL fragment. This is the flow ' +
      'TapisUI itself signs in with.',
  },
};

const LoginUrlSection: React.FC<{
  basePath?: string;
  clientId?: string;
  callbackUrl?: string;
}> = ({ basePath, clientId, callbackUrl }) => {
  const [flow, setFlow] = useState<AuthFlow>('code');
  const url = buildAuthorizeUrl({ basePath, clientId, callbackUrl, flow });

  return (
    <Box sx={{ mt: 1 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          mb: 1,
        }}
      >
        <Typography sx={{ fontSize: '0.95rem', fontWeight: 600 }}>
          Login URL
        </Typography>
        {/* Selector sits above the URL, never below it, so switching flows
            cannot move the control the pointer is already on. */}
        <ToggleButtonGroup
          size="small"
          exclusive
          value={flow}
          onChange={(_, next: AuthFlow | null) => next && setFlow(next)}
          disabled={!url}
        >
          {(Object.keys(FLOWS) as AuthFlow[]).map((key) => (
            <ToggleButton
              key={key}
              value={key}
              sx={{ textTransform: 'none', fontSize: '0.72rem', py: 0.25 }}
            >
              {FLOWS[key].label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {url ? (
        <>
          <TextCopyField value={url} placeholder="Login URL" />
          {/* Fixed height: the two descriptions differ in length, and without
              this the "open" link below would jump as the user toggles. */}
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: 'text.secondary',
              mt: 0.75,
              minHeight: '2.6em',
            }}
          >
            {FLOWS[flow].returns}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            Add <code>&amp;state=…</code> with a value your app generates and
            checks on return.
          </Typography>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.78rem',
              marginTop: 6,
            }}
          >
            Open in a new tab <OpenInNew sx={{ fontSize: '0.9rem' }} />
          </a>
        </>
      ) : (
        <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
          {callbackUrl
            ? 'No Tapis base URL resolved for this session.'
            : 'This client has no Callback URL. Add one with Edit and the login ' +
              'URL appears here. The authorize request is rejected unless ' +
              'redirect_uri matches the registered callback exactly.'}
        </Typography>
      )}
    </Box>
  );
};

export default LoginUrlSection;
