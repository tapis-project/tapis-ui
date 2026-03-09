import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useTapisConfig } from '@tapis/tapisui-hooks';

/**
 * Extract a parameter from the full URL href.
 *
 * Because this app uses HashRouter, the OAuth2 implicit redirect produces
 * a double-hash URL like:
 *   http://localhost:3000/#/oauth2#access_token=...&expires_in=14400&state=...
 *
 * window.location.hash merges both fragments, so URLSearchParams on the hash
 * alone doesn't work reliably.  Searching the full href is the safest approach.
 */
const getParam = (href: string, key: string): string | undefined => {
  const pattern = new RegExp(`[#&?]${key}=([^&#]*)`);
  const match = href.match(pattern);
  return match ? decodeURIComponent(match[1]) : undefined;
};

const OAuth2: React.FC = () => {
  const { setAccessToken } = useTapisConfig();
  const navigate = useHistory();

  const href = window.location.href;
  const access_token = getParam(href, 'access_token') ?? '';
  const expires_in_raw = getParam(href, 'expires_in');
  const expires_in = expires_in_raw ? parseInt(expires_in_raw, 10) : 14400;
  const expires_at = new Date(Date.now() + expires_in * 1000).toISOString();

  useEffect(() => {
    if (!access_token) {
      console.error('OAuth2 callback: no access_token found in URL');
      navigate.push('/login');
      return;
    }
    // Wait for setAccessToken before the push. Otherwise user might get placed back to / without set token
    const doAuth = async () => {
      await setAccessToken({ access_token, expires_at, expires_in });
      navigate.push(`/`);
    };
    doAuth();
  }, []);

  return <></>;
};

export default OAuth2;
