import { useContext } from 'react';
import { useQuery } from 'react-query';
import Cookies from 'js-cookie';
import { Authenticator } from '@tapis/tapis-typescript';
import jwt_decode from 'jwt-decode';
import TapisContext from './TapisContext';

const useTapisConfig = () => {
  const { basePath } = useContext(TapisContext);

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
    accessToken: data,
    setAccessToken,
    claims,
    pathTenantId: pathTenantId ?? undefined,
    tokenTenantId: tokenTenantId ?? "couldn't derive tenant_id",
    domainsMatched: domainsMatched,
    username: claims['tapis/username'],
  };
};

export default useTapisConfig;
