import { useContext, useEffect, useMemo, useRef } from 'react';
import { useQuery } from 'react-query';
import Cookies from 'js-cookie';
import { Authenticator } from '@tapis/tapis-typescript';
import jwt_decode from 'jwt-decode';
import TapisContext from './TapisContext';

/**
 * Has the JWT passed its `exp`? Tokens without an `exp` claim are treated as
 * live — the caller has already rejected undecodable tokens by then.
 * `now` is injectable so the boundary is testable.
 */
export const isJwtExpired = (
  claims: { exp?: number },
  now: number = Date.now()
): boolean => {
  if (!claims?.exp) return false;
  return now >= claims.exp * 1000;
};

/**
 * Does a token's tenant match the host we are pointed at? A mismatch signs
 * the user out, so a false negative locks people out of a working session.
 *
 * The trailing dot matters: without it tenant "tacc" would match the host
 * "taccdev.tapis.io", and every tenant whose id prefixes another's host would
 * silently accept the wrong token.
 */
export const tenantMatchesHost = (
  basePath: string | undefined,
  tokenTenantId: string | undefined
): boolean => {
  if (!basePath || !tokenTenantId) return false;
  return basePath.toLowerCase().includes(tokenTenantId.toLowerCase() + '.');
};

const useTapisConfig = () => {
  const { basePath, mlHubBasePath } = useContext(TapisContext);

  const getAccessToken = ():
    | Authenticator.NewAccessTokenResponse
    | undefined => {
    const cookie = Cookies.get('tapis-token');
    if (!!cookie) return JSON.parse(cookie);
    return undefined;
  };

  const { data, refetch } = useQuery<
    Authenticator.NewAccessTokenResponse | undefined
  >('tapis-token', getAccessToken, {
    initialData: () => getAccessToken(),
  });

  const setAccessToken = async (
    resp: Authenticator.NewAccessTokenResponse | null | undefined
  ): Promise<void> => {
    // Need to create wildcard path from current basePath
    // basePath:   https://scoped.tapis.io, must turn into .scoped.tapis.io
    // basePath can be undefined when VITE_TAPIS_BASE_URL is unset on localhost —
    // don't crash auth flows over a cookie domain we can't compute.
    const cookieDomain = basePath
      ? basePath.replace('https://', '.').replace('http://', '.')
      : undefined;
    if (!resp) {
      Cookies.remove('tapis-token');
      // Requires the correct domain as the cookie is set to the domain to remove
      Cookies.remove('X-Tapis-Token', { domain: cookieDomain });
      await refetch();
      return;
    }

    const expires = new Date(resp.expires_at ?? 0);

    Cookies.set('tapis-token', JSON.stringify(resp), { expires });
    // The tenant-wide `domain` here is DELIBERATE, not an oversight: pods are
    // served from subdomains of the tenant host and authenticate by reading
    // this header (tapis_auth), so the cookie has to reach them. The tradeoff
    // is that visiting any pod hands that pod a token acting as you, and that
    // logout only clears the tenant you are currently on. Both are written up
    // in docs/AUTH_AND_PERF_BACKLOG.md §A2 (the vector) and §A4 (multi-tenant)
    // — read those before widening the scope or reusing this pattern.
    Cookies.set('X-Tapis-Token', resp.access_token ?? '', {
      expires,
      domain: cookieDomain,
      secure: true,
    });
    await refetch();
  };
  // Decoding is memoized on the token string, which matters more than it looks:
  // ~280 modules call this hook, so an unmemoized decode ran on every render of
  // every consumer. A CPU profile of the expanded pod overview put 806 ms in
  // jwt-decode alone — the single largest identified cost under the hooks
  // package, ahead of react-query (225 ms). The token changes at login and
  // logout; the claims cannot change without it changing.
  const { claims, jwtDecodeFailed } = useMemo((): {
    claims: { [key: string]: any };
    jwtDecodeFailed: boolean;
  } => {
    const token = data?.access_token;
    if (!token) return { claims: {}, jwtDecodeFailed: false };
    try {
      // Safely decode JWT — garbage tokens won't crash the app
      return { claims: jwt_decode(token) as any, jwtDecodeFailed: false };
    } catch (e) {
      console.error('Failed to decode access token JWT:', e);
      return { claims: {}, jwtDecodeFailed: true };
    }
  }, [data?.access_token]);

  // Check if the JWT has expired based on the `exp` claim (seconds since epoch)
  const isTokenExpired = isJwtExpired(claims as { exp?: number });

  const pathTenantId = basePath
    ? basePath.replace('https://', '').replace('http://', '').split('.')[0]
    : undefined;

  // Parse the site information from basePath
  const pathSiteId = (() => {
    if (!basePath) return undefined;

    const domain = basePath.replace('https://', '').replace('http://', '');
    const parts = domain.split('.');

    // If we have at least 3 parts (e.g., tacc.develop.tapis.io)
    if (parts.length >= 3) {
      // Check if second part is a known site identifier
      const secondPart = parts[1];

      // List of known site identifiers that indicate non-prod environments
      const knownSites = ['develop', 'staging', 'test', 'dev', 'stage'];

      if (knownSites.includes(secondPart.toLowerCase())) {
        return secondPart;
      }

      // If it's not a known site but we have more than 3 parts,
      // it might be a custom domain like tacc.myown.site.com
      if (parts.length > 3) {
        // Join all parts except the tenant as the site
        return parts.slice(1).join('.');
      }
    }

    // For cases like tacc.tapis.io or test.tapis.io
    if (parts.length === 3) {
      const baseDomain = parts.slice(1).join('.'); // e.g., "tapis.io"

      // If it's the main tapis.io domain, it's prod (no site identifier needed)
      if (baseDomain === 'tapis.io') {
        return undefined; // prod environment
      } else {
        // Custom domain like myown.site.com
        return baseDomain;
      }
    }

    return undefined;
  })();

  const tokenTenantId: string | undefined =
    claims['tapis/tenant_id'] ?? undefined;

  // A localhost/dev basePath can't encode a tenant in its domain. In that case the Tapis service
  // resolves the tenant from the token claim server-side (tapisservice's local-dev path in
  // resolve_tenant_id_for_request), so this is NOT a real mismatch — don't log the user out.
  // This is what makes the dev-only Pods proxy (VITE_PODS_BASE_URL) work: pods calls go same-origin
  // to localhost, and the service trusts the token's tenant.
  const isLocalDevBasePath =
    !!basePath &&
    /\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|172\.17\.0\.1)(:|\/|$)/i.test(
      basePath
    );

  // Inline logic for domainsMatched
  const domainsMatched = isLocalDevBasePath
    ? true
    : tenantMatchesHost(basePath, tokenTenantId);

  // Use a ref to avoid re-triggering the effect when setAccessToken identity changes
  const setAccessTokenRef = useRef(setAccessToken);
  setAccessTokenRef.current = setAccessToken;

  // Handle invalid tokens in a useEffect (not during render) to avoid React render-loop
  useEffect(() => {
    if (!data?.access_token) return;

    // Undecodable JWT (garbage token) — clear it immediately
    if (jwtDecodeFailed) {
      console.warn('Access token is not a valid JWT. Clearing token.');
      setAccessTokenRef.current(null);
      return;
    }

    // Expired JWT — clear it and force re-login
    if (isTokenExpired) {
      console.warn('Access token has expired (JWT exp claim). Logging out.');
      setAccessTokenRef.current(null);
      return;
    }

    // Tenant mismatch — token is for a different tenant than the current basePath
    if (tokenTenantId && Object.keys(claims).length > 0 && !domainsMatched) {
      console.error(
        `The basePath ${basePath} does not match the tenant_id ${tokenTenantId}. Logging user out.`
      );
      setAccessTokenRef.current(null);
    }
  }, [
    data?.access_token,
    isTokenExpired,
    jwtDecodeFailed,
    tokenTenantId,
    domainsMatched,
    basePath,
  ]);

  return {
    basePath,
    mlHubBasePath,
    accessToken: isTokenExpired || jwtDecodeFailed ? undefined : data,
    setAccessToken,
    claims,
    pathTenantId: pathTenantId ?? undefined,
    pathSiteId,
    tokenTenantId: tokenTenantId ?? "couldn't derive tenant_id",
    domainsMatched: domainsMatched,
    username: claims['tapis/username'] as string,
  };
};

export default useTapisConfig;
