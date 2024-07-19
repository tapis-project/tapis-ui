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
      await refetch();
      return;
    }
    const expires = new Date(resp.expires_at ?? 0);
    Cookies.set('tapis-token', JSON.stringify(resp), { expires });
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
  };
};

export default useTapisConfig;
