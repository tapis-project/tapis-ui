import React, { useState, useCallback, useEffect } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query'
import Cookies from 'js-cookie';
import { Authenticator } from '@tapis/tapis-typescript';
import TapisContext, { TapisContextType } from '../context/TapisContext';

interface TapisProviderProps {
  children: React.ReactNode[] | React.ReactNode,
  token?: Authenticator.NewAccessTokenResponse,
  tenantUrl: string
}

const TapisProvider: React.FC<TapisProviderProps> = ({ token, tenantUrl, children }) => {

  const [ accessToken, setAccessToken ] = useState<Authenticator.NewAccessTokenResponse>(token);
  const accessTokenCallback = useCallback(
    (token) => {
      setAccessToken(token);
      Cookies.set('tapis-token', JSON.stringify(token));
    },
    [setAccessToken]
  )
  const contextValue: TapisContextType  = {
    accessToken,
    setAccessToken: accessTokenCallback,
    tenantUrl
  }

  // Attempt to load cached cookie
  useEffect(
    () => {
      // A passed token will override anything in Cookies
      if (token) {
        return
      };

      // Attempt to load token from cookie
      const cookie = Cookies.get('tapis-token');
      if (!cookie) return;
      const cookieToken: Authenticator.NewAccessTokenResponse = JSON.parse(cookie);

      // Do not load expired tokens
      const expiry = Date.parse(cookieToken.expires_at);
      if (expiry < Date.now()) {
        return;
      }

      setAccessToken(cookieToken);
    },
    [token, setAccessToken]
  )

  const queryClient = new QueryClient();


  return (
    <TapisContext.Provider value={contextValue}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </TapisContext.Provider>
  )
}

export default TapisProvider;