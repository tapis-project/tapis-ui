import React from 'react';
import { InfoStrip, useLoginPrompt } from '@tapis/tapisui-common';

// The not-logged-in bar for deployments with a public pre-login landing —
// rendered on the prelogin main page only. The InfoStrip in the portal's
// purple: static text (no marquee — motion is an accessibility wart) and
// one press.

const DEFAULT_TEXT =
  "You're browsing without being signed in — pages that need your account " +
  "won't work until you log in.";

const PreloginBanner: React.FC<{ text?: string }> = ({ text }) => {
  // Raise the login dialog over this page rather than navigating to /login,
  // which on an implicit-auth deployment hands off to the identity provider
  // and bounces straight back to the landing route. useLoginPrompt is the one
  // way to send that request that survives the app's hash router; see it for
  // why a hand-rolled history.replace here silently did nothing.
  const promptLogin = useLoginPrompt();

  return (
    <InfoStrip
      tone="purple"
      text={text ?? DEFAULT_TEXT}
      actions={[{ label: 'Sign in', onClick: () => promptLogin() }]}
    />
  );
};

export default PreloginBanner;
