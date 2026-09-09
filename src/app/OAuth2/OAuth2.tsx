import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useTapisConfig, checkAccessToken } from '@tapis/tapisui-hooks';
import { takeLoginReturn } from 'app/Login/loginReturn';

/**
 * Extract a parameter from the full URL href. HashRouter makes the OAuth2
 * redirect a double-hash URL:
 *   http://localhost:3000/#/oauth2#access_token=...&expires_in=14400&state=...
 * so URLSearchParams on location.hash alone is unreliable; search the href.
 */
export const getParam = (href: string, key: string): string | undefined => {
  const pattern = new RegExp(`[#&?]${key}=([^&#]*)`);
  const match = href.match(pattern);
  return match ? decodeURIComponent(match[1]) : undefined;
};

/**
 * Reason this deployment cannot use the returned token, or undefined if it
 * can. Applies the useTapisConfig rules before storing the token, so a token
 * that would be cleared is reported here.
 */
export const refuseToken = (
  accessToken: string,
  basePath: string | undefined
): string | undefined => {
  const refusal = checkAccessToken(accessToken, { basePath });
  if (!refusal) return undefined;
  if (refusal.reason === 'unreadable') {
    return (
      'The sign-in service sent back a token this page cannot read. Try ' +
      'signing in again; if it keeps happening, contact your tenant admins.'
    );
  }
  if (refusal.reason === 'expired') {
    return (
      'The sign-in service sent back a token that had already expired. ' +
      "Check this computer's date and time, then sign in again."
    );
  }
  return (
    `The sign-in service sent back a token for the ${refusal.tenant} tenant, but ` +
    `this page is ${basePath}. Sign in from that tenant's own page, or ` +
    'contact your tenant admins.'
  );
};

/** `href` is injectable for tests (jsdom cannot redefine window.location). */
const OAuth2: React.FC<{ href?: string }> = ({ href: hrefProp }) => {
  const { setAccessToken, basePath } = useTapisConfig();
  const navigate = useHistory();
  const [failed, setFailed] = useState<string | undefined>(undefined);

  const href = hrefProp ?? window.location.href;
  const access_token = getParam(href, 'access_token') ?? '';
  const expires_in_raw = getParam(href, 'expires_in');
  const expires_in = expires_in_raw ? parseInt(expires_in_raw, 10) : 14400;
  const expires_at = new Date(Date.now() + expires_in * 1000).toISOString();

  // Consume the callback once: StrictMode runs effects twice in development,
  // and the second run would not find `tapis-login-from`.
  const consumed = useRef(false);

  useEffect(() => {
    if (consumed.current) return;
    consumed.current = true;

    if (!access_token) {
      console.error('OAuth2 callback: no access_token found in URL');
      navigate.replace('/login');
      return;
    }

    const refused = refuseToken(access_token, basePath);
    if (refused) {
      setFailed(refused);
      return;
    }

    const doAuth = async () => {
      await setAccessToken({ access_token, expires_at, expires_in });

      // Confirm the token persisted. A cookie can be dropped silently (over
      // the size limit, or `secure` on a plain http origin).
      if (!getStoredToken()) {
        setFailed(
          'Sign-in completed, but the session could not be stored in this ' +
            'browser. Check that cookies are enabled for this site.'
        );
        return;
      }

      const from = takeLoginReturn();
      // replace, not push: the callback URL contains the token and must not stay in history
      navigate.replace(from ?? '/');
    };
    doAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (failed) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>{failed}</p>
        <button type="button" onClick={() => navigate.replace('/login')}>
          Back to sign in
        </button>
      </div>
    );
  }

  return <></>;
};

/** Reads the token cookie the way useTapisConfig does. Module-local. */
function getStoredToken(): string | undefined {
  const match = document.cookie.match(/(?:^|;\s*)tapis-token=([^;]*)/);
  return match ? match[1] : undefined;
}

export default OAuth2;
