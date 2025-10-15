import { useContext } from 'react';
import { useQuery } from 'react-query';
import Cookies from 'js-cookie';
import { Authenticator } from '@tapis/tapis-typescript';
import jwt_decode from 'jwt-decode';
import TapisContext from './TapisContext';

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
    if (!resp) {
      Cookies.remove('tapis-token');
      // Requires the correct domain as the cookie is set to the domain to remove
      Cookies.remove('X-Tapis-Token', {
        domain: basePath.replace('https://', '.').replace('http://', '.'),
      });
      await refetch();
      return;
    }

    const expires = new Date(resp.expires_at ?? 0);

    Cookies.set('tapis-token', JSON.stringify(resp), { expires });
    // Need to create wildcard path from current basePath
    // basePath:   https://scoped.tapis.io, must turn into .scoped.tapis.io
    Cookies.set('X-Tapis-Token', resp.access_token ?? '', {
      expires,
      domain: basePath.replace('https://', '.').replace('http://', '.'),
      secure: true,
    });
    await refetch();
  };
  console.debug(
    `useTapisConfig: basePath: ${basePath}, data.access_token exists:`,
    JSON.stringify(data?.access_token ? true : false, null, 2)
  );
  const claims: { [key: string]: any } = data?.access_token
    ? jwt_decode(data?.access_token)
    : {};

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

  // Inline logic for domainsMatched
  const domainsMatched =
    basePath && tokenTenantId
      ? basePath.toLowerCase().includes(tokenTenantId.toLowerCase() + '.')
      : false;

  if (tokenTenantId && Object.keys(claims).length > 0 && !domainsMatched) {
    console.error(
      `The basePath ${basePath} does not match the tenant_id ${tokenTenantId}. Logging user out.`
    );
    setAccessToken(null);
  }

  return {
    basePath,
    mlHubBasePath,
    accessToken: data,
    setAccessToken,
    claims,
    pathTenantId: pathTenantId ?? undefined,
    pathSiteId,
    tokenTenantId: tokenTenantId ?? "couldn't derive tenant_id",
    domainsMatched: domainsMatched,
    username: claims['tapis/username'],
  };
};

export default useTapisConfig;
