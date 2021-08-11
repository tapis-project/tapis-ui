import { useContext } from 'react';
import { useQuery } from 'react-query';
import Cookies from 'js-cookie';
import { Authenticator } from '@tapis/tapis-typescript';
import TapisContext from './TapisContext';

const useTapisConfig = () => {
  const { basePath } = useContext(TapisContext);

  const getAccessToken = ():
    | Authenticator.NewAccessTokenResponse
    | undefined => {
    const cookie = Cookies.get('tapis-token');
    if (!!cookie) return JSON.parse(Cookies.get('tapis-token'));
    return cookie;
  };

  const { data, refetch } = useQuery<Authenticator.NewAccessTokenResponse>(
    'tapis-token',
    getAccessToken,
    {
        initialData: () => getAccessToken()
    }
  );

  const setAccessToken = async (
    resp: Authenticator.NewAccessTokenResponse
  ): Promise<void> => {
    const expires = new Date(resp.expires_at ?? 0);
    Cookies.set('tapis-token', JSON.stringify(resp), { expires });
    await refetch();
  };

  return {
    basePath,
    accessToken: data,
    setAccessToken
  };
};

export default useTapisConfig;
