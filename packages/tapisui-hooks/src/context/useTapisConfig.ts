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

  const claims: { [key: string]: any } = data?.access_token
    ? jwt_decode(data?.access_token)
    : {};

  return {
    basePath,
    accessToken: data,
    setAccessToken,
    claims,
    username: claims['tapis/username'],
  };
};

export default useTapisConfig;
