import React, { useState, useCallback, useEffect } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query'
import Cookies from 'js-cookie';
import { Authenticator } from '@tapis/tapis-typescript';
import TapisContext, { TapisContextType } from '../context/TapisContext';

interface TapisProviderProps {
  token?: Authenticator.NewAccessTokenResponse,
  basePath: string
}

const TapisProvider: React.FC<React.PropsWithChildren<TapisProviderProps> > = ({ token, basePath, children }) => {

  const [ accessToken, setAccessToken ] = useState<Authenticator.NewAccessTokenResponse>(token);

  // Callback wrapper for setting the access token, that also saves it in a cookie
  const accessTokenCallback = useCallback(
    (token) => {
      setAccessToken(token);
      Cookies.set('tapis-token', JSON.stringify(token));
    },
    [setAccessToken]
  )

  // Provide a context state for the rest of the application, including
  // a way of modifying the state
  const contextValue: TapisContextType = {
    accessToken,
    setAccessToken: accessTokenCallback,
    basePath
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

  // react-query client
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